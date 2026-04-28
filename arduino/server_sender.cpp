#include "server_sender.h"

void sendDataToServer(VehicleData data) {
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // בנה JSON
  StaticJsonDocument<512> doc;
  doc["clientId"]       = CLIENT_ID;
  doc["engineTemp"]     = data.engineTemp;
  doc["batteryVoltage"] = data.batteryVoltage;
  doc["rpm"]            = data.rpm;
  doc["speed"]          = data.speed;

  if (data.dtcCodes.length() > 0) {
    JsonArray dtcArray = doc.createNestedArray("dtcCodes");
    dtcArray.add(data.dtcCodes);
  }

  String jsonBody;
  serializeJson(doc, jsonBody);

  Serial.println("📤 Sending to server...");
  int httpCode = http.POST(jsonBody);

  if (httpCode == 201) {
    Serial.println("✅ Data sent successfully!");
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpCode);
  }

  http.end();
}
