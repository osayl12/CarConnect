#include "wifi_manager.h"

void connectToWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi failed! Will retry...");
  }
}

void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected, reconnecting...");
    connectToWiFi();
  }
}

bool isWiFiConnected() {
  return WiFi.status() == WL_CONNECTED;
}
