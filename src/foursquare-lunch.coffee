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


# TODO: error if FOURSQUARE variables not set.
# TODO: error if default lat/long not set and are needed

addv = require 'address-validator'

module.exports = (robot) ->
  config = secrets:
    clientId: process.env.FOURSQUARE_CLIENT_ID
    clientSecret: process.env.FOURSQUARE_CLIENT_SECRET
    accessToken: process.env.FOURSQUARE_ACCESS_TOKEN
    redirectUrl: "localhost"
  config.version = '20150722'

  locates = () -> robot.brain.data.lunch_locates ?= {}

  # locates()[key]
  # locates()[key]
  # locates()[key] = value

  foursquare = require('node-foursquare')(config)

  robot.respond /lunch/i, (msg) ->
    from_user = msg.message.user.name

    if _match = msg.message.text.match('([0-9\.]+) mile')
      meters = parseInt(_match[1] * 1609.344)
    if _match = msg.message.text.match('([0-9\.]+) meter')
      meters = parseInt _match[1]
    if _match = msg.message.text.match('near (.*)')
      near = _match[1]
      addv.validate near, addv.match.unknown, (err, exact, inexact) ->
        if err == null
          if exact[0]?
            lat = exact[0].location.lat
            lon = exact[0].location.lon
          else if inexact[0]?
            lat = inexact[0].location.lat
            lon = inexact[0].location.lon
          else
            lat = null
            lon = null
        if lat? && lon?
          if !(locates()[from_user] && (locates()[from_user].lat == lat && locates()[from_user].lon == lon))
            msg.reply "remembering #{lat},#{lon} for your future searches"
            locates()[from_user] = {lat:lat,lon:lon}
          near = null
        suggestLunchSpot msg, meters, near, lat, lon
    else
      if locates()[from_user]
        lat = locates()[from_user].lat
        lon = locates()[from_user].lon
        msg.reply "using saved lat/long: #{lat},#{lon}"
        suggestLunchSpot msg, meters, null, lat, lon
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
      query: 'lunch'

    if meters
      params.radius = meters

    foursquare.Venues.explore lat, long, near, params, config.secrets.accessToken, (error, response) ->
      if error
        return msg.send error

      if response['groups'][0]['items'].length > 0
        spot = msg.random response['groups'][0]['items']
      else
        msg.send "no restaurants found"
        return

      if msg.robot.adapterName == "slack"
        msg.send "<https://foursquare.com/v/#{spot.venue.id}|#{spot.venue.name}>"
      else
        msg.send "#{spot.venue.name} https://foursquare.com/v/#{spot.venue.id}"
