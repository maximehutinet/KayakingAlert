#!/usr/bin/python
# coding=utf-8

__author__ = "Maxime Hutinet"
__version__ = "0.0.1"
__status__ = "Development"

#    Kayaking Alert : Kayaking Alert is a website allowing users to check 
#    the water level, temperature and weather forecast of their favorite rivers in Switzerland.
#    Copyright (C) 2019  Maxime Hutinet

#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.

#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.

#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <https://www.gnu.org/licenses/>.

from RiverClient import RiverClient


class River:
    def __init__(self,data,riverNumber):
        myRiverClient = RiverClient()
        self.stationNumber = myRiverClient.getStationNumber(data,riverNumber)
        self.name = myRiverClient.getStationName(data,riverNumber)
        self.waterBodyName = myRiverClient.getStationWaterBodyName(data,riverNumber)
        self.type = myRiverClient.getStationWaterBodyType(data,riverNumber)
        self.latitude = myRiverClient.getStationLatitude(data,riverNumber)
        self.longitude = myRiverClient.getStationLongitude(data,riverNumber)
        self.dateAndTime = myRiverClient.getDateAndTime(data,riverNumber)
        self.temperature = myRiverClient.getTemperature(data,riverNumber)
        self.waterLevel = myRiverClient.getWaterLevel(data,riverNumber)

    def createDictFromVariable(self):
        return {'station-number': self.stationNumber,
                'name': self.name,
                'water-body-name': self.waterBodyName,
                'type': self.type,
                'latitude': self.latitude,
                'longitude': self.longitude,
                'date-and-time': self.dateAndTime,
                'temperature': self.temperature,
                'water-level': self.waterLevel
                }
