Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper [
  'adapters/slack.coffee',
  '../src/foursquare-lunch.coffee'
]

# Alter time as test runs
originalDateNow = Date.now
mockDateNow = () ->
  return Date.parse('Tue Mar 30 2018 14:10:00 GMT-0500 (CDT)')

describe 'hubot-untappd-friends for slack', ->
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
          [
            'hubot',
            {
              "attachments": [
                {
                  "color": "good",
                  "fallback": "AVO Nashville (3001 Charlotte Ave Ste 200)",
                  "title": "AVO Nashville",
                  "title_link": "https://foursquare.com/v/5592de25498e1053218edf29",
                  "fields": [
                    {
                      "title": "Address",
                      "value": "3001 Charlotte Ave Ste 200",
                      "short": false
                    },
                    {
                      "title": "Rating",
                      "value": "8",
                      "short": true
                    },
                    {
                      "title": "Price",
                      "value": "Moderate",
                      "short": true
                    }
                  ]
                }
              ]
            }
          ]
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # hubot lunch
  it 'responds with a lunch location (random test)', (done) ->
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
      .replyWithFile(200, __dirname + '/fixtures/venues-explore-full.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot lunch')
    setTimeout(() ->
      try
        expect(selfRoom.messages[1][1]).to.be.a('object')
        expect(selfRoom.messages[1][1]).to.have.property('attachments')
        expect(selfRoom.messages[1][1]['attachments'][0]).to.have.property('title')
        expect(selfRoom.messages[1][1]['attachments'][0]).to.have.property('title_link')
        expect(selfRoom.messages[1][1]['attachments'][0]).to.have.property('fallback')
        expect(selfRoom.messages[1][1]['attachments'][0]).to.have.property('fields')
        done()
      catch err
        done err
      return
    , 1000)
