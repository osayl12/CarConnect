#ifndef OBD2_READER_H
#define OBD2_READER_H

#include <Arduino.h>
#include "config.h"

// Struct לשמירת כל נתוני הרכב
struct VehicleData {
  float  engineTemp;      // טמפרטורת מנוע (°C)
  float  batteryVoltage;  // מתח סוללה (V)
  int    rpm;             // סל"ד
  int    speed;           // מהירות (km/h)
  String dtcCodes;        // קודי תקלה
};

void    initELM327();
String  sendOBD2Command(String cmd);
float   readEngineTemp();
int     readRPM();
int     readSpeed();
float   readBatteryVoltage();
String  readDTCCodes();
VehicleData readAllData();

#endif
