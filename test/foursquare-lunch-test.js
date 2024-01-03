/* global describe beforeEach afterEach, it, describe */
/* eslint-disable func-names */
const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper([
  '../src/foursquare-lunch.js',
]);

// Alter time as test runs
const originalDateNow = Date.now;
const mockDateNow = () => Date.parse('Tue Mar 30 2018 14:10:00 GMT-0500 (CDT)');

describe('hubot-foursquare-lunch', () => {
  beforeEach(function () {
    process.env.HUBOT_LOG_LEVEL = 'error';
    process.env.FOURSQUARE_CLIENT_ID = 'foobar1';
    process.env.FOURSQUARE_CLIENT_SECRET = 'foobar2';
    process.env.HUBOT_DEFAULT_LATITUDE = 36.1514179;
    process.env.HUBOT_DEFAULT_LONGITUDE = -86.8262359;
    Date.now = mockDateNow;
    nock.disableNetConnect();
    this.room = helper.createRoom();
  });

  afterEach(function () {
    delete process.env.HUBOT_LOG_LEVEL;
    delete process.env.FOURSQUARE_CLIENT_ID;
    delete process.env.FOURSQUARE_CLIENT_SECRET;
    delete process.env.HUBOT_DEFAULT_LATITUDE;
    delete process.env.HUBOT_DEFAULT_LONGITUDE;
    Date.now = originalDateNow;
    nock.cleanAll();
    this.room.destroy();
  });

  // hubot lunch
  it('responds with a lunch location', function (done) {
    nock('https://api.foursquare.com')
      .get('/v2/venues/explore')
      .query({
        price: '1,2,3',
        openNow: true,
        query: 'lunch',
        radius: 1600,
        ll: '36.1514179,-86.8262359',
        client_id: 'foobar1',
        client_secret: 'foobar2',
        v: '20140806',
      })
      .replyWithFile(200, `${__dirname}/fixtures/venues-explore-single.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot lunch');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot lunch'],
            [
              'hubot',
              'AVO Nashville (3001 Charlotte Ave Ste 200) - http://www.eatavo.com',
            ],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});

describe('hubot-foursquare-lunch missing configuration', () => {
  beforeEach(function () {
    Date.now = mockDateNow;
    nock.disableNetConnect();
    this.room = helper.createRoom();
  });

  afterEach(function () {
    Date.now = originalDateNow;
    nock.cleanAll();
    this.room.destroy();
  });

  // hubot lunch
  it('responds with error messages', function (done) {
    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot lunch');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot lunch'],
            ['hubot', 'Ensure that HUBOT_DEFAULT_LATITUDE is set.'],
            ['hubot', 'Ensure that HUBOT_DEFAULT_LONGITUDE is set.'],
            ['hubot', 'Ensure that FOURSQUARE_CLIENT_ID is set.'],
            ['hubot', 'Ensure that FOURSQUARE_CLIENT_SECRET is set.'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});
