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

import xmltodict
import Convert


class RiverClient:

    def XMLtoDict(self,file):
        with open(file) as fd:
            doc = xmltodict.parse(fd.read())
        return doc

    def getNumberOfStation(self,data):
        return len(data['locations']['station'])

    def getStationInfo(self,data,stationNumber):
        return data['locations']['station'][stationNumber]

    def getStationNumber(self,data,stationNumber):
        return data['locations']['station'][stationNumber]['@number']

    def getStationName(self,data,stationNumber):
        return data['locations']['station'][stationNumber]['@name']

    def getStationWaterBodyName(self,data,stationNumber):
        return data['locations']['station'][stationNumber]['@water-body-name']

    def getStationWaterBodyType(self,data,stationNumber):
        return data['locations']['station'][stationNumber]['@water-body-type']

    def getStationLatitude(self,data,stationNumber):
         easting = float(data['locations']['station'][stationNumber]['@easting'])
         northing = float(data['locations']['station'][stationNumber]['@northing'])
         return Convert.CHtoWGSlat(easting,northing)

    def getStationLongitude(self,data,stationNumber):
         easting = float(data['locations']['station'][stationNumber]['@easting'])
         northing = float(data['locations']['station'][stationNumber]['@northing'])
         return Convert.CHtoWGSlng(easting,northing)

    def getDateAndTime(self,data,stationNumber):
        if type(data['locations']['station'][stationNumber]['parameter']) == list:
            return data['locations']['station'][stationNumber]['parameter'][0]['datetime'].replace('T', ' at ')

        else:
            return data['locations']['station'][stationNumber]['parameter']['datetime'].replace('T', ' at ')

    def getTemperature(self,data,stationNumber):
        position = 0
        tempExist = False
        temperature = None
        if type(data['locations']['station'][stationNumber]['parameter']) == list:
            while temperature == None:
                try:
                    if data['locations']['station'][stationNumber]['parameter'][position]['@name'] == 'Temperatur':
                        tempExist = True
                        if tempExist:
                            temperature = data['locations']['station'][stationNumber]['parameter'][position]['max-1h']
                    else:
                        if position >= len(data['locations']['station'][stationNumber]['parameter']):
                            break
                        position += 1

                except IndexError:
                    return None
        else:
            temperature = None

        return temperature

    def getWaterLevel(self,data,stationNumber):
        position = 0
        levelExist = False
        level = None
        if type(data['locations']['station'][stationNumber]['parameter']) == list:
            while level == None:
                try:
                    if data['locations']['station'][stationNumber]['parameter'][position]['@name'] == 'Abfluss m3/s':
                        levelExist = True
                        if levelExist:
                            level = data['locations']['station'][stationNumber]['parameter'][position]['max-1h']
                    else:
                        if position >= len(data['locations']['station'][stationNumber]['parameter']):
                            break
                        position += 1

                except IndexError:
                    return None
        else:
            level = None

        return level






