/*
 * CarConnect - ESP32 Main File
 *
 * קבצים:
 *   config.h            - הגדרות WiFi, שרת, פינים
 *   wifi_manager.h/cpp  - ניהול חיבור WiFi
 *   obd2_reader.h/cpp   - קריאת נתונים מהרכב דרך ELM327
 *   server_sender.h/cpp - שליחת נתונים לשרת
 *
 * חיבורים פיזיים:
 *   ELM327 TX  →  ESP32 GPIO16 (RX2)
 *   ELM327 RX  →  ESP32 GPIO17 (TX2)
 *   ELM327 GND →  ESP32 GND
 *   ELM327 VCC →  ESP32 VIN (5V)
 *   RX2 (GPIO16) ← TX של ELM327
 *   TX2 (GPIO17) → RX של ELM327
 *
 * או אם משתמשים ב-OBD2 Shield ישירות:
 *   נחבר לפי ה-Shield שתבחר (ראה הסבר נפרד)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==================== הגדרות WiFi ====================
const char* WIFI_SSID = "YOUR_WIFI_NAME";     // שנה לשם ה-WiFi שלך
const char* WIFI_PASSWORD = "YOUR_WIFI_PASS"; // שנה לסיסמת ה-WiFi שלך

// ==================== הגדרות שרת ====================
const char* SERVER_URL = "http://YOUR_SERVER_IP:5000/api/sensor-data";
const char* CLIENT_ID  = "YOUR_USER_ID_FROM_DB"; // ה-_id של המשתמש ב-MongoDB

// ==================== הגדרות OBD2 ====================
#define OBD2_SERIAL Serial2
#define OBD2_BAUD 38400
#define SEND_INTERVAL 10000  // שלח נתונים כל 10 שניות

// PIDs - קודי פקודה לקריאת נתוני רכב
#define PID_ENGINE_TEMP    "0105"  // טמפרטורת קירור מנוע
#define PID_RPM            "010C"  // סל"ד
#define PID_SPEED          "010D"  // מהירות
#define PID_BATTERY        "0142"  // מתח מד
#define PID_DTC_REQUEST    "03"    // בקשת קודי תקלה

// משתנים גלובליים
float engineTemp = 0;
float batteryVoltage = 0;
int   rpm = 0;
int   speed = 0;
String dtcCodes = "";
unsigned long lastSendTime = 0;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("🚗 CarConnect ESP32 Starting...");

  // התחל Serial2 לתקשורת עם ELM327
  OBD2_SERIAL.begin(OBD2_BAUD, SERIAL_8N1, 16, 17); // RX=16, TX=17
  delay(500);

  // חבר ל-WiFi
  connectToWiFi();

  // אתחל ELM327
  initELM327();

  Serial.println("✅ Ready to read OBD2 data!");
}

// ==================== LOOP ====================
void loop() {
  // קרא נתוני רכב
  engineTemp     = readEngineTemp();
  rpm            = readRPM();
  speed          = readSpeed();
  batteryVoltage = readBatteryVoltage();
  dtcCodes       = readDTCCodes();

  // הדפס למסך
  Serial.printf("🌡️  Temp: %.1f°C | ⚡ %.2fV | 🔄 %d RPM | 🚀 %d km/h\n",
                engineTemp, batteryVoltage, rpm, speed);

  if (dtcCodes.length() > 0) {
    Serial.println("⚠️  DTC Codes: " + dtcCodes);
  }

  // שלח לשרת כל SEND_INTERVAL
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendDataToServer();
    lastSendTime = millis();
  }

  delay(1000);
}

// ==================== WiFi ====================
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
    Serial.println("WiFi disconnected, reconnecting...");
    connectToWiFi();
  }
}

// ==================== ELM327 ====================
void initELM327() {
  Serial.println("🔌 Initializing ELM327...");

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

// ==================== OBD2 Readers ====================
float readEngineTemp() {
  String resp = sendOBD2Command("01 05");  // PID 05 = Engine Coolant Temp
  int idx = resp.indexOf("41 05");
  if (idx == -1) return -1;

  String hexVal = resp.substring(idx + 6, idx + 8);
  hexVal.trim();
  int raw = strtol(hexVal.c_str(), NULL, 16);
  return raw - 40.0;  // Formula: A - 40
}

int readRPM() {
  String resp = sendOBD2Command("01 0C");  // PID 0C = RPM
  int idx = resp.indexOf("41 0C");
  if (idx == -1) return -1;

  String hexA = resp.substring(idx + 6, idx + 8);
  String hexB = resp.substring(idx + 9, idx + 11);
  int A = strtol(hexA.c_str(), NULL, 16);
  int B = strtol(hexB.c_str(), NULL, 16);
  return ((A * 256) + B) / 4;  // Formula: ((A*256)+B)/4
}

int readSpeed() {
  String resp = sendOBD2Command("01 0D");  // PID 0D = Vehicle Speed
  int idx = resp.indexOf("41 0D");
  if (idx == -1) return -1;

  String hexVal = resp.substring(idx + 6, idx + 8);
  return strtol(hexVal.c_str(), NULL, 16);  // Direct km/h
}

float readBatteryVoltage() {
  String resp = sendOBD2Command("ATRV");  // Read voltage
  float voltage = 0;
  int vIdx = resp.indexOf("V");
  if (vIdx > 0) {
    voltage = resp.substring(0, vIdx).toFloat();
  }
  return voltage;
}

String readDTCCodes() {
  String resp = sendOBD2Command("03");  // Mode 03 = Request Stored DTCs
  String codes = "";

  if (resp.indexOf("43") != -1 && resp.indexOf("NO DATA") == -1) {
    // Parse DTC codes from response
    // This is simplified — full parsing depends on response format
    codes = resp;
  }

  return codes;
}

// ==================== שליחה לשרת ====================
void sendDataToServer() {
  checkWiFi();
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // בנה JSON
  StaticJsonDocument<512> doc;
  doc["clientId"]       = CLIENT_ID;
  doc["engineTemp"]     = engineTemp;
  doc["batteryVoltage"] = batteryVoltage;
  doc["rpm"]            = rpm;
  doc["speed"]          = speed;
  doc["fuelLevel"]      = 0;  // אם יש חיישן דלק

  // הוסף קודי DTC אם קיימים
  if (dtcCodes.length() > 0) {
    JsonArray dtcArray = doc.createNestedArray("dtcCodes");
    dtcArray.add(dtcCodes);  // ניתן לפרסר מספר קודים
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
