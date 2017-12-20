# Note: You must set up the following variables inside a .env file in the root
# of the project to test the foursquare response:
#   FOURSQUARE_CLIENT_ID
#   FOURSQUARE_CLIENT_SECRET
#   FOURSQUARE_ACCESS_TOKEN
#   HUBOT_DEFAULT_LATITUDE
#   HUBOT_DEFAULT_LONGITUDE

require('dotenv').config()
chai = require 'chai'
Helper = require 'hubot-test-helper'
helper = new Helper('../src/foursquare-lunch.coffee')

expect = chai.expect

describe 'foursquare-lunch', ->

  beforeEach ->
    @room = helper.createRoom()

  afterEach ->
    # Tear it down after the test to free up the listener.
    @room.destroy()

  context 'user requests a lunch spot', ->

    it 'should respond in under two seconds', ->
      new Promise (resolve, reject) =>
        @room.user.say('alice', 'hubot lunch')
        setTimeout( () ->
          resolve()
        , 1900)
      .then (data) =>
        expect(@room.messages.length).to.be.eql(2)
