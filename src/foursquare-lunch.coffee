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
  config.foursquare =
    mode: 'foursquare',
    version: '20140806'
  config.winston =
    loggers:
      core:
        'console':
          level: process.env.HUBOT_LOG_LEVEL || 'error'

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
      robot.logger.debug response
      if error
        robot.logger.error error
        return msg.send error

      if response['groups'][0]['items'].length == 0
        msg.send "Did not find any nearby lunch spots."
        return

      spot = msg.random response['groups'][0]['items']
      robot.logger.debug spot

      switch robot.adapterName
        when 'slack'
          payload = {
            fallback: spot.venue.name,
            title: spot.venue.name,
            title_link: "https://foursquare.com/v/#{spot.venue.id}",
            fields: []
          }

          # Photo
          if spot.venue.photos.count > 0
            payload.thumb_url = spot.venue.photos.groups[0].items[0].prefix.replace(/\/$/, '') +
                                spot.venue.photos.groups[0].items[0].suffix

          # Address
          if spot.venue.location.address?
            payload.fallback = "#{spot.venue.name} (#{spot.venue.location.address})"
            payload.fields.push {
              title: "Address",
              value: "#{spot.venue.location.address}",
              short: false
            }

          # Rating
          if spot.venue.rating?
            if spot.venue.rating.toFixed(1) <= 5
              payload.color = 'danger'
            if spot.venue.rating.toFixed(1) <= 7
              payload.color = 'warning'
            if spot.venue.rating.toFixed(1) <= 10
              payload.color = 'good'
            payload.fields.push {
              title: "Rating",
              value: "#{spot.venue.rating}",
              short: true
            }

          # Price
          if spot.venue.price?
            payload.fields.push {
              title: "Price",
              value: "#{spot.venue.price.message}",
              short: true
            }

          msg.send {
            attachments: [payload]
          }
        else
          msg.send spot.venue.name
