chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'

expect = chai.expect

describe 'foursquare-lunch', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()

    # Must be defined so as to avoid throwing errors in lower scripts
    process.env.FOURSQUARE_CLIENT_ID = 'somedata'
    process.env.FOURSQUARE_CLIENT_SECRET = 'somedata'
    process.env.FOURSQUARE_ACCESS_TOKEN = 'somedata'

    require('../src/foursquare-lunch')(@robot)

  it 'registers a respond', ->
    expect(@robot.respond).to.have.been.calledWith(/lunch$/i)
