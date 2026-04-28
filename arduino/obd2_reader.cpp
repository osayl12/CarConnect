#include "obd2_reader.h"

#define OBD2_SERIAL Serial2

void initELM327() {
  Serial.println("🔌 Initializing ELM327...");
  OBD2_SERIAL.begin(OBD2_BAUD, SERIAL_8N1, OBD2_RX_PIN, OBD2_TX_PIN);
  delay(500);

  sendOBD2Command("ATZ");    // Reset
  delay(1500);
  sendOBD2Command("ATE0");   // Echo off
  delay(300);
  sendOBD2Command("ATL0");   // Linefeeds off
  delay(300);
  sendOBD2Command("ATSP0");  // Auto protocol
  delay(300);

  Serial.println("✅ ELM327 Ready");
}

String sendOBD2Command(String cmd) {
  OBD2_SERIAL.println(cmd);
  delay(200);

  String response = "";
  unsigned long startTime = millis();

  while (millis() - startTime < 1000) {
    if (OBD2_SERIAL.available()) {
      char c = OBD2_SERIAL.read();
      if (c != '\r') response += c;
      if (response.endsWith(">")) break;
    }
  }

  response.trim();
  return response;
}

float readEngineTemp() {
  String resp = sendOBD2Command("01 05");
  int idx = resp.indexOf("41 05");
  if (idx == -1) return -1;

  String hexVal = resp.substring(idx + 6, idx + 8);
  hexVal.trim();
  int raw = strtol(hexVal.c_str(), NULL, 16);
  return raw - 40.0;  // Formula: A - 40
}

int readRPM() {
  String resp = sendOBD2Command("01 0C");
  int idx = resp.indexOf("41 0C");
  if (idx == -1) return -1;

  String hexA = resp.substring(idx + 6, idx + 8);
  String hexB = resp.substring(idx + 9, idx + 11);
  int A = strtol(hexA.c_str(), NULL, 16);
  int B = strtol(hexB.c_str(), NULL, 16);
  return ((A * 256) + B) / 4;
}

int readSpeed() {
  String resp = sendOBD2Command("01 0D");
  int idx = resp.indexOf("41 0D");
  if (idx == -1) return -1;

  String hexVal = resp.substring(idx + 6, idx + 8);
  return strtol(hexVal.c_str(), NULL, 16);
}

float readBatteryVoltage() {
  String resp = sendOBD2Command("ATRV");
  float voltage = 0;
  int vIdx = resp.indexOf("V");
  if (vIdx > 0) {
    voltage = resp.substring(0, vIdx).toFloat();
  }
  return voltage;
}

String readDTCCodes() {
  String resp = sendOBD2Command("03");
  if (resp.indexOf("43") != -1 && resp.indexOf("NO DATA") == -1) {
    return resp;
  }
  return "";
}

VehicleData readAllData() {
  VehicleData data;
  data.engineTemp     = readEngineTemp();
  data.batteryVoltage = readBatteryVoltage();
  data.rpm            = readRPM();
  data.speed          = readSpeed();
  data.dtcCodes       = readDTCCodes();
  return data;
}
