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

module.exports = (robot) ->
  config = secrets:
    clientId: process.env.FOURSQUARE_CLIENT_ID
    clientSecret: process.env.FOURSQUARE_CLIENT_SECRET
    accessToken: process.env.FOURSQUARE_ACCESS_TOKEN
    redirectUrl: "localhost"
  config.version = '20150722'

  foursquare = require('node-foursquare')(config);

  robot.respond /lunch$/i, (msg) ->
    suggestLunchSpot msg

  suggestLunchSpot = (msg) ->
    params =
      price: '1,2,3',
      openNow: true,
      sortByDistance: true
      query: 'lunch'
      radius: 1600

    # Call Foursquare API
    foursquare.Venues.explore process.env.HUBOT_DEFAULT_LATITUDE, process.env.HUBOT_DEFAULT_LONGITUDE, false, params, config.secrets.accessToken, (error, response) ->
      if error
        return msg.send error
      spot = msg.random response['groups'][0]['items']
      msg.send spot.venue.name