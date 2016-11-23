# Description
#   Use Foursquare API to pick a lunch spot
#
# Configuration:
#   FOURSQUARE_CLIENT_ID
#   FOURSQUARE_CLIENT_SECRET
#   FOURSQUARE_ACCESS_TOKEN
#   HUBOT_DEFAULT_LATITUDE
#   HUBOT_DEFAULT_LONGITUDE
#
# Commands:
#   hubot lunch - Pick a random lunch spot.
#
# Author:
#   stephenyeargin

addv = require 'address-validator'

module.exports = (robot) ->
  config = secrets:
    clientId: process.env.FOURSQUARE_CLIENT_ID
    clientSecret: process.env.FOURSQUARE_CLIENT_SECRET
    accessToken: process.env.FOURSQUARE_ACCESS_TOKEN
    redirectUrl: "localhost"
  config.version = '20150722'

  foursquare = require('node-foursquare')(config)

  robot.respond /lunch/i, (msg) ->
    
    if _match = msg.message.text.match('([0-9\.]+) mile')
      meters = parseInt(_match[1] * 1609.344)
    if _match = msg.message.text.match('([0-9\.]+) meter')
      meters = parseInt _match[1]
    if _match = msg.message.text.match('near (.*)')
      near = _match[1]
      addv.validate near, addv.match.unknown, (err, exact, inexact) ->
        if err == null
          if exact[0]?
            console.log 'set exact'
            lat = exact[0].location.lat
            lon = exact[0].location.lon
          else if inexact[0]?
            console.log 'set inexact'
            lat = inexact[0].location.lat
            lon = inexact[0].location.lon
          else
            lat = null
            lon = null
        if lat > 0 && lon > 0
          near = null
        suggestLunchSpot msg, meters, near, lat, lon
    else
      suggestLunchSpot msg, meters

  suggestLunchSpot = (msg, meters, near, lat, long) ->

    if !near && !lat && !long
      lat  = process.env.HUBOT_DEFAULT_LATITUDE
      long = process.env.HUBOT_DEFAULT_LONGITUDE

    params =
      price: '1,2,3',
      openNow: true,
      limit: 50
      sortByDistance: true
      radius: meters||1600
      query: 'lunch'

    foursquare.Venues.explore lat, long, near, params, config.secrets.accessToken, (error, response) ->
      if error
        return msg.send error
      spot = msg.random response['groups'][0]['items']
      if msg.robot.adapterName == "slack"
        msg.send "<https://foursquare.com/v/#{spot.venue.id}|#{spot.venue.name}>"
      else
        msg.send "#{spot.venue.name} https://foursquare.com/v/#{spot.venue.id}"
