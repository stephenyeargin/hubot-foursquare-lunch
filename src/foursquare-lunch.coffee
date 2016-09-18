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

util = require 'util'


module.exports = (robot) ->
  config = secrets:
    clientId: process.env.FOURSQUARE_CLIENT_ID
    clientSecret: process.env.FOURSQUARE_CLIENT_SECRET
    accessToken: process.env.FOURSQUARE_ACCESS_TOKEN
    redirectUrl: "localhost"
  config.version = '20150722'

  foursquare = require('node-foursquare')(config);

  robot.respond /lunch/i, (msg) ->
    if _match = msg.message.text.match('([0-9\.]+) mile')
      meters = parseInt(_match[1] * 1609.344)
    if _match = msg.message.text.match('near (.*)')
      near = _match[1]
    suggestLunchSpot msg, meters, near

  suggestLunchSpot = (msg, meters, near) ->

    if near
      lat  = false
      long = false
    else
      near = false
      lat  = process.env.HUBOT_DEFAULT_LATITUDE
      long = process.env.HUBOT_DEFAULT_LONGITUDE

    # console.log "lat #{lat} long #{long} near #{near}"

    params =
      price: '1,2,3',
      openNow: true,
      limit: 50
      sortByDistance: true
      radius: meters||1600
      query: 'lunch'

    # console.log params
    # Call Foursquare API
    foursquare.Venues.explore lat, long, near, params, config.secrets.accessToken, (error, response) ->
      if error
        return msg.send error
      # console.log util.inspect response.groups[0].items
      # console.log util.inspect response
      # console.log util.inspect response.suggestedFilters.filters
      # for itm in response['groups'][0]['items']
      #  console.log itm.venue.name
      spot = msg.random response['groups'][0]['items']
      msg.send spot.venue.name
