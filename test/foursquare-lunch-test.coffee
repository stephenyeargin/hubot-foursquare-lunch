Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper [
  '../src/foursquare-lunch.coffee'
]

# Alter time as test runs
originalDateNow = Date.now
mockDateNow = () ->
  return Date.parse('Tue Mar 30 2018 14:10:00 GMT-0500 (CDT)')

describe 'hubot-untappd-friends', ->
  beforeEach ->
    process.env.HUBOT_LOG_LEVEL='error'
    process.env.FOURSQUARE_CLIENT_ID='foobar1'
    process.env.FOURSQUARE_CLIENT_SECRET='foobar2'
    process.env.FOURSQUARE_ACCESS_TOKEN='foobar3'
    process.env.HUBOT_DEFAULT_LATITUDE=36.1514179
    process.env.HUBOT_DEFAULT_LONGITUDE=-86.8262359
    Date.now = mockDateNow
    nock.disableNetConnect()
    @room = helper.createRoom()

  afterEach ->
    delete process.env.HUBOT_LOG_LEVEL
    delete process.env.FOURSQUARE_CLIENT_ID
    delete process.env.FOURSQUARE_CLIENT_SECRET
    delete process.env.FOURSQUARE_ACCESS_TOKEN
    delete process.env.HUBOT_DEFAULT_LATITUDE
    delete process.env.HUBOT_DEFAULT_LONGITUDE
    Date.now = originalDateNow
    nock.cleanAll()
    @room.destroy()

  # hubot lunch
  it 'responds with a lunch location', (done) ->
    nock('https://api.foursquare.com')
      .get('/v2/venues/explore')
      .query(
        price: '1,2,3',
        openNow: true
        sortByDistance: true,
        query: 'lunch'
        radius: 1600,
        ll: '36.1514179,-86.8262359',
        oauth_token: 'foobar3',
        v: '20140806'
      )
      .replyWithFile(200, __dirname + '/fixtures/venues-explore-single.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot lunch')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot lunch']
          ['hubot', 'AVO Nashville']
        ]
        done()
      catch err
        done err
      return
    , 1000)
