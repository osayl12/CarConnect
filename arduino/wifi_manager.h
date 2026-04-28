#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include "config.h"

void connectToWiFi();
void checkWiFi();
bool isWiFiConnected();

#endif
