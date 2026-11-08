// Copy this file to config.h and fill in real values. config.h is git-ignored.
#pragma once

#include <Arduino.h>

constexpr const char *WIFI_SSID = "your-wifi-ssid";
constexpr const char *WIFI_PASSWORD = "your-wifi-password";

// Tracking source credentials issued by an admin for this ESP32 (source type "esp32").
constexpr const char *SOURCE_ID = "your-source-id";
constexpr const char *SOURCE_SECRET = "your-source-secret";

// Production: TLS on 443. Local development: USE_TLS = false, the backend LAN IP, port 3001.
constexpr bool USE_TLS = true;
constexpr const char *SERVER_HOST = "tram-tracking.rsu.ac.th";
constexpr uint16_t SERVER_PORT = 443;

// Root CA that signed SERVER_HOST's certificate chain. See README.md for how to fetch it.
// Unused when USE_TLS is false.
constexpr const char *ROOT_CA_PEM = R"PEM(-----BEGIN CERTIFICATE-----
PASTE-THE-ROOT-CA-CERTIFICATE-HERE
-----END CERTIFICATE-----
)PEM";

// Car ACC (ignition) line, reaching the GPIO through an optocoupler or divider.
// The default suits an optocoupler that pulls the pin to GND while ignition is on.
constexpr uint8_t IGNITION_PIN = 27;
constexpr uint8_t IGNITION_PIN_MODE = INPUT_PULLUP;
constexpr int IGNITION_ACTIVE_LEVEL = LOW;
