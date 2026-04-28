#ifndef CONFIG_H
#define CONFIG_H

// ==================== WiFi ====================
#define WIFI_SSID       "YOUR_WIFI_NAME"
#define WIFI_PASSWORD   "YOUR_WIFI_PASS"

// ==================== Server ====================
#define SERVER_URL      "http://YOUR_SERVER_IP:5000/api/sensor-data"
#define CLIENT_ID       "YOUR_USER_ID_FROM_DB"

// ==================== OBD2 / ELM327 ====================
#define OBD2_RX_PIN     16
#define OBD2_TX_PIN     17
#define OBD2_BAUD       38400

// ==================== Timing ====================
#define SEND_INTERVAL   10000   // שלח נתונים כל 10 שניות

#endif
