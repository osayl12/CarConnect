#ifndef SERVER_SENDER_H
#define SERVER_SENDER_H

#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "obd2_reader.h"
#include "config.h"

void sendDataToServer(VehicleData data);

#endif
