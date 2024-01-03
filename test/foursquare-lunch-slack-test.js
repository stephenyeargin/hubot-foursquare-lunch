/* global describe beforeEach afterEach, it, describe */
/* eslint-disable func-names */
const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper([
  'adapters/slack.js',
  '../src/foursquare-lunch.js',
]);

// Alter time as test runs
const originalDateNow = Date.now;
const mockDateNow = () => Date.parse('Tue Mar 30 2018 14:10:00 GMT-0500 (CDT)');

describe('hubot-foursquare-lunch for slack', () => {
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
              {
                attachments: [
                  {
                    color: 'good',
                    fallback: 'AVO Nashville (3001 Charlotte Ave Ste 200) - http://www.eatavo.com',
                    title: 'AVO Nashville',
                    title_link: 'https://foursquare.com/v/5592de25498e1053218edf29',
                    thumb_url: 'https://ss3.4sqi.net/img/categories_v2/food/vegetarian_bg_120.png',
                    fields: [
                      {
                        title: 'Address',
                        value: '3001 Charlotte Ave Ste 200',
                        short: true,
                      },
                      {
                        title: 'Menu',
                        value: '<http://www.eatavo.com/menu/|View Menu>',
                        short: true,
                      },
                      {
                        title: 'Website',
                        value: 'http://www.eatavo.com',
                        short: true,
                      },
                      {
                        title: 'Rating',
                        value: '8 out of 10',
                        short: true,
                      },
                      {
                        title: 'Category',
                        value: 'Vegetarian / Vegan',
                        short: true,
                      },
                      {
                        title: 'Price',
                        value: 'Moderate',
                        short: true,
                      },
                    ],
                  },
                ],
                unfurl_links: false,
              },
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

  // hubot lunch
  it('responds with a lunch location (random test)', function (done) {
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
      .replyWithFile(200, `${__dirname}/fixtures/venues-explore-full.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot lunch');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages[1][1]).to.be.a('object');
          expect(selfRoom.messages[1][1]).to.have.property('attachments');
          expect(selfRoom.messages[1][1].attachments[0]).to.have.property('title');
          expect(selfRoom.messages[1][1].attachments[0]).to.have.property('title_link');
          expect(selfRoom.messages[1][1].attachments[0]).to.have.property('fallback');
          expect(selfRoom.messages[1][1].attachments[0]).to.have.property('fields');
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});
