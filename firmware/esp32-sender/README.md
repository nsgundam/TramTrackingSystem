# ESP32 GPS sender

Arduino sketch that turns an ESP32 with a u-blox NEO-7M GPS into a tracking source for the backend.
ESP32 sources are Socket.IO-only: the backend rejects their HTTP ingest with
`403 TRANSPORT_NOT_ALLOWED`, so locations go over a Socket.IO v4 connection. Login and trip
lifecycle stay on HTTP.

## Hardware

- GPS: NEO-7M TX to GPIO16 (ESP32 RX2), NEO-7M RX to GPIO17 (ESP32 TX2), 9600 baud. This matches
  the team's working GPS diagnostic sketch (`HardwareSerial gpsSerial(2)`,
  `gpsSerial.begin(9600, SERIAL_8N1, 16, 17)`).
- Ignition: the ESP32 is permanently powered. The car's ACC line reaches `IGNITION_PIN` through an
  optocoupler or a divider. The default config (GPIO27, `INPUT_PULLUP`, active `LOW`) suits an
  optocoupler whose transistor pulls the pin to GND while ACC is on. For a divider that drives the
  pin high, set `IGNITION_PIN_MODE = INPUT` and `IGNITION_ACTIVE_LEVEL = HIGH`. Never feed 12 V
  directly to a GPIO.

## Toolchain (pinned)

| Component | Version |
| --- | --- |
| esp32 Arduino core (`esp32:esp32`, Espressif board index) | 3.3.12 |
| WebSockets by Markus Sattler (links2004/arduinoWebSockets) | 2.7.2 |
| ArduinoJson by Benoit Blanchon | 7.4.3 |
| TinyGPSPlus by Mikal Hart | 1.0.3 |

In Arduino IDE, add `https://espressif.github.io/arduino-esp32/package_esp32_index.json` under
Preferences > Additional boards manager URLs, install the esp32 core at the version above, and
install the three libraries at those versions from the Library Manager. Select the board
"ESP32 Dev Module".

The sketch reaches two protected members of the WebSockets library's `SocketIOclient` (see
`SenderSocket`). Upgrading that library needs a re-check of `SocketIOclient.cpp`.

Command-line build:

```sh
arduino-cli compile --fqbn esp32:esp32:esp32 firmware/esp32-sender
```

## Configuration

```sh
cp firmware/esp32-sender/config.example.h firmware/esp32-sender/config.h
```

Fill in `config.h`. It is git-ignored and is the only place for WiFi credentials, `SOURCE_ID`, and
`SOURCE_SECRET`. The sketch never prints the secret or the session token.

- Production: `USE_TLS = true`, `SERVER_HOST = "tram-tracking.rsu.ac.th"`, `SERVER_PORT = 443`, and
  `ROOT_CA_PEM` set to the root certificate of the server's chain.
- Local development: `USE_TLS = false`, `SERVER_HOST` set to the backend machine's LAN IP,
  `SERVER_PORT = 3001`.

The sketch verifies the server certificate against `ROOT_CA_PEM`. It has no insecure TLS mode. To
find the root CA, list the chain the server presents:

```sh
openssl s_client -connect tram-tracking.rsu.ac.th:443 -servername tram-tracking.rsu.ac.th -showcerts </dev/null
```

The last certificate printed is the intermediate. Its `i:` (issuer) line names the root, for
example `ISRG Root X1`. Download that root from the CA's own site (for Let's Encrypt,
<https://letsencrypt.org/certificates/>) in PEM form and paste the whole
`-----BEGIN CERTIFICATE-----` block into `ROOT_CA_PEM`. Pin the root rather than the leaf, because
the leaf changes on every renewal.

## Behavior

Each `loop()` derives the desired state from its inputs and acts only on the difference, so a
reboot or a failed request converges on the next pass. Each operation has its own exponential
backoff, from 1 s up to 60 s.

1. WiFi: reconnect with backoff.
2. Session: `POST /api/auth/vehicle-login`. The token is refreshed 2 minutes before `expiresIn`, or
   at once after the server reports the credential invalid. A refreshed token forces a socket
   reconnect, because the server binds the token at the Socket.IO handshake.
3. Trip: ignition on with no trip calls `POST /api/trips/start`. The call is idempotent, so a
   reboot adopts the trip that is already open. Ignition off with a trip calls
   `PUT /api/trips/:id/end`. The trip id is cleared on 2xx, 400, 403, 404, or 409. It is kept
   and retried on network errors, 5xx, and 429, and after a re-login on 401.
4. Heartbeat: `POST /api/trips/:id/heartbeat` every 60 s while ignition is on. The backend
   auto-closes a trip after 15 minutes without activity. If the trip is closed, the sketch clears
   its id and step 3 starts a new trip.
5. Socket: connected only while ignition is on and a session is valid.
6. Location: while the socket is ready, the fix is valid and under 5 s old, and no ack is pending,
   the sketch emits `send-location` every 2 s with `sourceId`, `lat`, `lng`, `tripId` (when known),
   `speed` in m/s and `bearing` (GPS course). It omits `accuracy`, because the NEO-7M reports only
   unitless HDOP, not a radius in metres.

After a reboot with ignition off, the sketch does not know the id of a trip left open before the
reboot. The backend closes that trip after 15 minutes of inactivity.

### Socket.IO wire protocol

The WebSockets library opens Engine.IO v4 with a polling handshake, then upgrades to WebSocket.
The sketch adds:

- Auth in the namespace CONNECT packet: `40{"token":"<jwt>"}`. The server replies `40{"sid":...}`
  (ready) or `44{"message":...}` (rejected). A message that contains "temporarily unavailable" is
  retried with the same token. Any other rejection forces a new login.
- Events with an ack id: `42<id>["send-location",{...}]`. The ack is `43<id>[{"ok":...}]`. Ack
  codes are handled as follows. `RATE_LIMITED` pauses for `retryAfter` seconds.
  `SENDER_CREDENTIAL_INVALID` forces a new login. `TRIP_OWNERSHIP_MISMATCH` drops the trip id so
  the trip restarts. Other errors back off.
- No `Origin` header. The library sends `Origin: file://` by default, and the backend's CORS policy
  answers it with HTTP 400.

Server broadcasts (vehicle state, `error-response`) are ignored.

## Serial log (115200 baud)

The sketch logs one line per state transition, for example `WIFI: connected 192.168.1.40`,
`AUTH: logged in (refresh in 780s)`, `IGNITION: on`, `TRIP: started <id> (new)`,
`SOCKET: connecting -> ready`, and `SEND: rejected RATE_LIMITED`. GPS health logs mirror the
diagnostic sketch:

- `GPS: no bytes, check wiring 16/17`: no bytes from the module for 5 s.
- `GPS: no fix yet (chars=… checksum ok=… fail=… sats=…)`: bytes arrive but there is no fresh fix.
- `GPS: fix (sats=…)`: a fix is available.
