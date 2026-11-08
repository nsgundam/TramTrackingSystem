// ESP32 GPS sender for the Tram Tracking backend. See README.md for setup and the protocol.
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SocketIOclient.h>
#include <TinyGPSPlus.h>

#include "config.h"

constexpr uint32_t GPS_BAUD = 9600;
constexpr int8_t GPS_RX_PIN = 16;
constexpr int8_t GPS_TX_PIN = 17;

constexpr uint32_t IGNITION_ON_DEBOUNCE_MS = 2000;
constexpr uint32_t IGNITION_OFF_DEBOUNCE_MS = 10000;  // rides out voltage dips while cranking

constexpr uint32_t SEND_INTERVAL_MS = 2000;
constexpr uint32_t GPS_MAX_FIX_AGE_MS = 5000;
constexpr uint32_t GPS_NO_BYTES_AFTER_MS = 5000;
constexpr uint32_t ACK_TIMEOUT_MS = 10000;
constexpr uint32_t NAMESPACE_CONNECT_TIMEOUT_MS = 10000;
constexpr uint32_t TRIP_HEARTBEAT_INTERVAL_MS = 60000;

constexpr uint32_t SESSION_FALLBACK_TTL_MS = 15UL * 60 * 1000;
constexpr uint32_t SESSION_REFRESH_MARGIN_MS = 2UL * 60 * 1000;
constexpr uint32_t SESSION_MIN_REFRESH_MS = 30000;
constexpr uint32_t SESSION_MAX_TTL_MS = 24UL * 60 * 60 * 1000;

constexpr uint32_t BACKOFF_BASE_MS = 1000;
constexpr uint32_t BACKOFF_MAX_MS = 60000;
constexpr uint16_t HTTP_TIMEOUT_MS = 5000;
constexpr uint32_t SOCKET_RECONNECT_INTERVAL_MS = 5000;

// Exponential backoff gate. Unsigned subtraction keeps it correct across millis() wrap.
struct Backoff {
  uint32_t startedAtMs = 0;
  uint32_t delayMs = 0;

  bool ready(uint32_t now) const { return now - startedAtMs >= delayMs; }
  void succeed() { delayMs = 0; }
  void fail(uint32_t now) {
    delayMs = delayMs == 0 ? BACKOFF_BASE_MS : min(delayMs * 2, BACKOFF_MAX_MS);
    startedAtMs = now;
  }
  void hold(uint32_t now, uint32_t ms) {
    delayMs = ms;
    startedAtMs = now;
  }
};

struct Ignition {
  bool on = false;
  bool raw = false;
  uint32_t rawSinceMs = 0;
};

struct Session {
  String token;
  uint32_t obtainedAtMs = 0;
  uint32_t ttlMs = 0;
  uint32_t generation = 0;

  uint32_t refreshAfterMs() const {
    uint32_t after = ttlMs > 2 * SESSION_REFRESH_MARGIN_MS ? ttlMs - SESSION_REFRESH_MARGIN_MS : ttlMs / 2;
    return max(after, SESSION_MIN_REFRESH_MS);
  }
  bool usable(uint32_t now) const { return token.length() > 0 && now - obtainedAtMs < refreshAfterMs(); }
  void invalidate() { token = ""; }
};

struct Trip {
  String id;
  uint32_t lastHeartbeatMs = 0;

  bool active() const { return id.length() > 0; }
  void clear() { id = ""; }
};

// Idle: library not pumped (ignition off or no session). Disconnected: library pumped, waiting for
// the WebSocket. Connecting: CONNECT packet with the token sent. Ready: server accepted the namespace.
enum class Link : uint8_t { Idle, Disconnected, Connecting, Ready };

struct PendingAck {
  uint32_t id = 0;  // 0 = nothing in flight
  uint32_t sentAtMs = 0;
};

enum class GpsHealth : uint8_t { Waiting, NoBytes, NoFix, Fix };

enum class HttpClass : uint8_t { Ok, Unauthorized, Rejected, Transient };

// SocketIOclient swallows the server's namespace CONNECT ack ("40{...}", SocketIOclient.cpp:228-230)
// and on ESP32 does not expose a CA-pinned TLS begin, so both are reached through the protected base.
class SenderSocket : public SocketIOclient {
 public:
  std::function<void()> onNamespaceConnected;

  void start(const char *host, uint16_t port, const char *url, const char *caPem) {
    if (caPem) {
      WebSocketsClient::beginSocketIOSSLWithCA(host, port, url, caPem, "arduino");
    } else {
      WebSocketsClient::beginSocketIO(host, port, url, "arduino");
    }
    WebSocketsClient::enableHeartbeat(60 * 1000, 90 * 1000, 5);
    initClient();
  }

 protected:
  void runCbEvent(WStype_t type, uint8_t *payload, size_t length) override {
    if (type == WStype_TEXT && length >= 2 && payload[0] == '4' && payload[1] == '0' && onNamespaceConnected) {
      onNamespaceConnected();
    }
    handleCbEvent(type, payload, length);
  }
};

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;
SenderSocket socketIO;

Ignition ignition;
Session session;
Trip trip;
Link linkState = Link::Idle;
PendingAck pending;
GpsHealth gpsHealth = GpsHealth::Waiting;

uint32_t nextAckId = 1;
uint32_t lastSendMs = 0;
uint32_t connectSentAtMs = 0;
uint32_t socketGeneration = 0;
uint32_t lastGpsChars = 0;
uint32_t lastGpsByteMs = 0;
bool wifiUp = false;

Backoff wifiBackoff, loginBackoff, tripBackoff, heartbeatBackoff, socketBackoff, sendBackoff;

const char *linkName(Link value) {
  switch (value) {
    case Link::Idle: return "idle";
    case Link::Disconnected: return "disconnected";
    case Link::Connecting: return "connecting";
    case Link::Ready: return "ready";
  }
  return "?";
}

void setLink(Link next) {
  if (next == linkState) return;
  Serial.printf("SOCKET: %s -> %s\n", linkName(linkState), linkName(next));
  linkState = next;
  if (next != Link::Ready) pending.id = 0;
}

String baseUrl() {
  return String(USE_TLS ? "https://" : "http://") + SERVER_HOST + ":" + SERVER_PORT;
}

// Returns the HTTP status, or a negative HTTPClient error for transport failures.
int httpJson(const char *method, const String &path, const String &body, JsonDocument &response) {
  WiFiClientSecure tlsClient;
  WiFiClient plainClient;
  if (USE_TLS) tlsClient.setCACert(ROOT_CA_PEM);
  NetworkClient &client = USE_TLS ? static_cast<NetworkClient &>(tlsClient) : plainClient;

  HTTPClient http;
  http.setConnectTimeout(HTTP_TIMEOUT_MS);
  http.setTimeout(HTTP_TIMEOUT_MS);
  if (!http.begin(client, baseUrl() + path)) return HTTPC_ERROR_CONNECTION_REFUSED;
  http.addHeader("Content-Type", "application/json");
  if (session.token.length() > 0) http.addHeader("Authorization", "Bearer " + session.token);

  int status = http.sendRequest(method, body);
  if (status > 0) deserializeJson(response, http.getString());
  http.end();
  return status;
}

HttpClass classify(int status) {
  if (status >= 200 && status < 300) return HttpClass::Ok;
  if (status == 401) return HttpClass::Unauthorized;
  if (status == 400 || status == 403 || status == 404 || status == 409) return HttpClass::Rejected;
  return HttpClass::Transient;
}

const char *errorCode(const JsonDocument &response) {
  return response["code"] | "none";
}

// jsonwebtoken semantics: a JSON number is seconds, a bare numeric string is milliseconds.
uint32_t parseTtlMs(JsonVariantConst value) {
  if (value.is<double>()) {
    double seconds = value.as<double>();
    return seconds > 0 ? (uint32_t)min(seconds * 1000.0, (double)SESSION_MAX_TTL_MS) : SESSION_FALLBACK_TTL_MS;
  }
  const char *text = value.as<const char *>();
  if (!text) return SESSION_FALLBACK_TTL_MS;

  char *unit = nullptr;
  double amount = strtod(text, &unit);
  if (unit == text || amount <= 0) return SESSION_FALLBACK_TTL_MS;
  while (*unit == ' ') unit++;

  double scale;
  switch (*unit) {
    case '\0': scale = 1; break;
    case 's': scale = 1000; break;
    case 'm': scale = unit[1] == 's' ? 1 : 60000; break;
    case 'h': scale = 3600000; break;
    case 'd': scale = 86400000; break;
    default: return SESSION_FALLBACK_TTL_MS;
  }
  return (uint32_t)min(amount * scale, (double)SESSION_MAX_TTL_MS);
}

void updateIgnition(uint32_t now) {
  bool raw = digitalRead(IGNITION_PIN) == IGNITION_ACTIVE_LEVEL;
  if (raw != ignition.raw) {
    ignition.raw = raw;
    ignition.rawSinceMs = now;
  }
  uint32_t debounce = raw ? IGNITION_ON_DEBOUNCE_MS : IGNITION_OFF_DEBOUNCE_MS;
  if (raw != ignition.on && now - ignition.rawSinceMs >= debounce) {
    ignition.on = raw;
    Serial.printf("IGNITION: %s\n", raw ? "on" : "off");
  }
}

void pumpGps(uint32_t now) {
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());

  if (gps.charsProcessed() != lastGpsChars) {
    lastGpsChars = gps.charsProcessed();
    lastGpsByteMs = now;
  }

  GpsHealth next;
  if (now - lastGpsByteMs >= GPS_NO_BYTES_AFTER_MS) {
    next = GpsHealth::NoBytes;
  } else if (lastGpsChars == 0) {
    next = GpsHealth::Waiting;
  } else if (!gps.location.isValid() || gps.location.age() > GPS_MAX_FIX_AGE_MS) {
    next = GpsHealth::NoFix;
  } else {
    next = GpsHealth::Fix;
  }
  if (next == gpsHealth) return;
  gpsHealth = next;

  switch (next) {
    case GpsHealth::NoBytes:
      Serial.printf("GPS: no bytes, check wiring %d/%d\n", GPS_RX_PIN, GPS_TX_PIN);
      break;
    case GpsHealth::NoFix:
      Serial.printf("GPS: no fix yet (chars=%lu checksum ok=%lu fail=%lu sats=%lu)\n",
                    (unsigned long)gps.charsProcessed(), (unsigned long)gps.passedChecksum(),
                    (unsigned long)gps.failedChecksum(), (unsigned long)gps.satellites.value());
      break;
    case GpsHealth::Fix:
      Serial.printf("GPS: fix (sats=%lu)\n", (unsigned long)gps.satellites.value());
      break;
    case GpsHealth::Waiting:
      break;
  }
}

bool reconcileWifi(uint32_t now) {
  bool up = WiFi.status() == WL_CONNECTED;
  if (up != wifiUp) {
    wifiUp = up;
    if (up) {
      Serial.printf("WIFI: connected %s\n", WiFi.localIP().toString().c_str());
      wifiBackoff.succeed();
    } else {
      Serial.println("WIFI: disconnected");
    }
  }
  if (!up && wifiBackoff.ready(now)) {
    wifiBackoff.fail(now);
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
  return up;
}

void login(uint32_t now) {
  session.invalidate();
  JsonDocument request;
  request["sourceId"] = SOURCE_ID;
  request["secret"] = SOURCE_SECRET;
  String body;
  serializeJson(request, body);

  JsonDocument response;
  int status = httpJson("POST", "/api/auth/vehicle-login", body, response);
  const char *token = response["token"];
  if (classify(status) != HttpClass::Ok || !token) {
    Serial.printf("AUTH: login failed (status=%d code=%s)\n", status, errorCode(response));
    loginBackoff.fail(now);
    return;
  }

  session.token = token;
  session.obtainedAtMs = millis();
  session.ttlMs = parseTtlMs(response["expiresIn"]);
  session.generation++;
  loginBackoff.succeed();
  Serial.printf("AUTH: logged in (refresh in %lus)\n", (unsigned long)(session.refreshAfterMs() / 1000));
}

void reconcileSession(uint32_t now) {
  if (!session.usable(now) && loginBackoff.ready(now)) login(now);
}

void onUnauthorized(const char *what) {
  Serial.printf("AUTH: %s rejected the token, re-login\n", what);
  session.invalidate();
}

void startTrip(uint32_t now) {
  JsonDocument response;
  int status = httpJson("POST", "/api/trips/start", "{}", response);
  HttpClass result = classify(status);
  const char *id = response["trip"]["id"];
  if (result == HttpClass::Ok && id) {
    trip.id = id;
    trip.lastHeartbeatMs = now;
    tripBackoff.succeed();
    Serial.printf("TRIP: started %s (%s)\n", id, status == 201 ? "new" : "existing");
    return;
  }
  if (result == HttpClass::Unauthorized) onUnauthorized("trip start");
  Serial.printf("TRIP: start failed (status=%d code=%s)\n", status, errorCode(response));
  tripBackoff.fail(now);
}

void endTrip(uint32_t now) {
  JsonDocument response;
  int status = httpJson("PUT", "/api/trips/" + trip.id + "/end", "", response);
  switch (classify(status)) {
    case HttpClass::Ok:
    case HttpClass::Rejected:
      Serial.printf("TRIP: closed %s (status=%d)\n", trip.id.c_str(), status);
      trip.clear();
      tripBackoff.succeed();
      return;
    case HttpClass::Unauthorized:
      onUnauthorized("trip end");
      break;
    case HttpClass::Transient:
      break;
  }
  Serial.printf("TRIP: end failed (status=%d code=%s)\n", status, errorCode(response));
  tripBackoff.fail(now);
}

void heartbeatTrip(uint32_t now) {
  JsonDocument response;
  int status = httpJson("POST", "/api/trips/" + trip.id + "/heartbeat", "{}", response);
  HttpClass result = classify(status);
  const char *tripStatus = response["trip"]["status"] | "";
  if (result == HttpClass::Ok && strcmp(tripStatus, "in_progress") == 0) {
    trip.lastHeartbeatMs = now;
    heartbeatBackoff.succeed();
    return;
  }
  if (result == HttpClass::Ok || result == HttpClass::Rejected) {
    Serial.printf("TRIP: %s no longer active (status=%d code=%s)\n", trip.id.c_str(), status, errorCode(response));
    trip.clear();
    return;
  }
  if (result == HttpClass::Unauthorized) onUnauthorized("trip heartbeat");
  Serial.printf("TRIP: heartbeat failed (status=%d code=%s)\n", status, errorCode(response));
  heartbeatBackoff.fail(now);
}

void reconcileTrip(uint32_t now) {
  if (ignition.on && !trip.active() && tripBackoff.ready(now)) {
    startTrip(now);
  } else if (!ignition.on && trip.active() && tripBackoff.ready(now)) {
    endTrip(now);
  } else if (ignition.on && trip.active() && now - trip.lastHeartbeatMs >= TRIP_HEARTBEAT_INTERVAL_MS &&
             heartbeatBackoff.ready(now)) {
    heartbeatTrip(now);
  }
}

void sendNamespaceConnect() {
  JsonDocument auth;
  auth["token"] = session.token;
  String payload;
  serializeJson(auth, payload);
  socketIO.send(sIOtype_CONNECT, payload);
  socketGeneration = session.generation;
  connectSentAtMs = millis();
  setLink(Link::Connecting);
}

void handleConnectError(const uint8_t *payload, size_t length) {
  JsonDocument error;
  deserializeJson(error, payload, length);
  const char *message = error["message"] | "";
  Serial.printf("SOCKET: handshake rejected: %s\n", message);
  if (strstr(message, "temporarily unavailable") == nullptr) session.invalidate();
  socketBackoff.fail(millis());
  setLink(Link::Disconnected);
}

void handleAck(const uint8_t *payload, size_t length) {
  char *rest = nullptr;
  uint32_t id = strtoul(reinterpret_cast<const char *>(payload), &rest, 10);
  if (pending.id == 0 || id != pending.id) return;
  uint32_t now = millis();
  pending.id = 0;

  JsonDocument filter;
  filter[0]["ok"] = true;
  filter[0]["code"] = true;
  filter[0]["retryAfter"] = true;
  JsonDocument ack;
  deserializeJson(ack, rest, length - (rest - reinterpret_cast<const char *>(payload)),
                  DeserializationOption::Filter(filter));
  JsonVariantConst result = ack[0];

  if (result["ok"] == true) {
    sendBackoff.succeed();
    return;
  }

  const char *code = result["code"] | "UNKNOWN";
  Serial.printf("SEND: rejected %s\n", code);
  if (strcmp(code, "RATE_LIMITED") == 0) {
    sendBackoff.hold(now, (result["retryAfter"] | 1) * 1000UL);
  } else if (strcmp(code, "SENDER_CREDENTIAL_INVALID") == 0) {
    session.invalidate();
    setLink(Link::Disconnected);
  } else if (strcmp(code, "SENDER_AUTH_REQUIRED") == 0) {
    setLink(Link::Disconnected);
  } else if (strcmp(code, "TRIP_OWNERSHIP_MISMATCH") == 0) {
    trip.clear();
  } else {
    sendBackoff.fail(now);
  }
}

void onSocketEvent(socketIOmessageType_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case sIOtype_CONNECT:  // fired by the library when the WebSocket opens, before the namespace handshake
      sendNamespaceConnect();
      break;
    case sIOtype_DISCONNECT:
      if (linkState != Link::Idle) setLink(Link::Disconnected);
      break;
    case sIOtype_ERROR:
      handleConnectError(payload, length);
      break;
    case sIOtype_ACK:
      handleAck(payload, length);
      break;
    default:
      break;  // broadcasts such as vehicle state and error-response are not needed here
  }
}

void reconcileSocket(uint32_t now, bool wanted) {
  if (!wanted) {
    if (linkState != Link::Idle) {
      setLink(Link::Idle);
      socketIO.disconnect();
    }
    return;
  }

  if (linkState == Link::Idle) {
    socketIO.start(SERVER_HOST, SERVER_PORT, "/socket.io/?EIO=4", USE_TLS ? ROOT_CA_PEM : nullptr);
    setLink(Link::Disconnected);
  }
  if (linkState == Link::Ready && socketGeneration != session.generation) {
    Serial.println("SOCKET: token refreshed, reconnecting");
    setLink(Link::Disconnected);
  }
  if (linkState == Link::Connecting && now - connectSentAtMs >= NAMESPACE_CONNECT_TIMEOUT_MS) {
    Serial.println("SOCKET: namespace connect timed out");
    socketBackoff.fail(now);
    setLink(Link::Disconnected);
  }
  if (linkState == Link::Disconnected && socketIO.isConnected()) socketIO.disconnect();
  if (linkState == Link::Disconnected && !socketBackoff.ready(now)) return;
  socketIO.loop();
}

bool gpsFixFresh() {
  return gps.location.isValid() && gps.location.age() <= GPS_MAX_FIX_AGE_MS;
}

void reconcileSend(uint32_t now) {
  if (pending.id != 0 && now - pending.sentAtMs >= ACK_TIMEOUT_MS) {
    Serial.println("SEND: ack timed out");
    pending.id = 0;
  }
  if (linkState != Link::Ready || pending.id != 0 || !gpsFixFresh()) return;
  if (!sendBackoff.ready(now) || now - lastSendMs < SEND_INTERVAL_MS) return;

  JsonDocument event;
  event.add("send-location");
  JsonObject location = event.add<JsonObject>();
  location["sourceId"] = SOURCE_ID;
  location["lat"] = gps.location.lat();
  location["lng"] = gps.location.lng();
  if (trip.active()) location["tripId"] = trip.id;
  if (gps.speed.isValid() && gps.speed.mps() <= 999.99) location["speed"] = gps.speed.mps();
  if (gps.course.isValid()) location["bearing"] = gps.course.deg();

  uint32_t id = nextAckId++;
  if (nextAckId == 0) nextAckId = 1;
  String json;
  serializeJson(event, json);
  String frame = String(id) + json;
  if (socketIO.sendEVENT(frame)) {
    pending = {id, now};
    lastSendMs = now;
  }
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  pinMode(IGNITION_PIN, IGNITION_PIN_MODE);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  socketIO.onEvent(onSocketEvent);
  socketIO.onNamespaceConnected = [] {
    socketBackoff.succeed();
    setLink(Link::Ready);
  };
  // The library's default "Origin: file://" header is rejected by the backend's CORS policy.
  socketIO.setExtraHeaders("");
  socketIO.setReconnectInterval(SOCKET_RECONNECT_INTERVAL_MS);

  Serial.printf("BOOT: source %s -> %s\n", SOURCE_ID, baseUrl().c_str());
}

void loop() {
  uint32_t now = millis();
  pumpGps(now);
  updateIgnition(now);

  bool online = reconcileWifi(now);
  bool needSession = online && (ignition.on || trip.active());
  if (needSession) reconcileSession(now);
  if (online && session.usable(now)) reconcileTrip(now);

  now = millis();
  reconcileSocket(now, online && ignition.on && session.usable(now));
  reconcileSend(now);
}
