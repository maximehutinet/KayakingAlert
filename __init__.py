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


from flask import Flask, render_template, request
from flask_restful import Resource, Api
from flask_cors import CORS
from RiverClient import RiverClient
from River import River

app = Flask(__name__)
api = Api(app)
CORS(app)


# Return a JSON with all the rivers of CH
class rivers(Resource):
    def get(self):
        fileName = "hydroweb.xml"
        myRiverClient = RiverClient()
        XMLtoDict = myRiverClient.XMLtoDict(fileName)
        riverList = []
        for x in range(0, int(myRiverClient.getNumberOfStation(XMLtoDict))):  # We go through all the station
            myRiver = River(XMLtoDict, x)
            if myRiver.type == 'river' and myRiver.waterLevel != None:  # If the station is a river then we add its dict to the list
                riverList.append(River(XMLtoDict, x).createDictFromVariable())

        myJson = {'rivers': riverList}
        return myJson


# Return a JSON with the specific river requested
class river(Resource):
    def get(self, stationNumber):
        fileName = "hydroweb.xml"
        myRiverClient = RiverClient()
        XMLtoDict = myRiverClient.XMLtoDict(fileName)
        river = []
        for x in range(0, int(myRiverClient.getNumberOfStation(XMLtoDict))):  # We go through all the station
            myRiver = River(XMLtoDict, x)
            if myRiver.stationNumber == stationNumber:  # If the station is a river then we add its dict to the list
                river.append(River(XMLtoDict, x).createDictFromVariable())

        myJson = {'river': river}
        return myJson


api.add_resource(rivers, '/rivers')
api.add_resource(river, '/river/<string:stationNumber>')


@app.route("/")
def hello(name=None):
    return render_template('index.html', name=name)
