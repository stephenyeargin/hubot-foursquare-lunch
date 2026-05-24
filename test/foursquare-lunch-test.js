/* eslint-disable no-await-in-loop */

// Set credentials before the foursquare client module is loaded
process.env.FOURSQUARE_CLIENT_ID = 'foobar1';
process.env.FOURSQUARE_CLIENT_SECRET = 'foobar2';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

// Alter time as test runs
const originalDateNow = Date.now;
const mockDateNow = () => Date.parse('Tue Mar 30 2018 14:10:00 GMT-0500 (CDT)');

test('hubot-foursquare-lunch', async (t) => {
  let bot;

  before(async () => {
    Date.now = mockDateNow;
    bot = await createTestBot();
  });

  after(async () => {
    Date.now = originalDateNow;
    bot.shutdown();
  });

  await t.test('responds with a lunch location', async () => {
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

    const response = await bot.sendAndWaitForResponse('hubot lunch');
    assert.equal(response, 'AVO Nashville (3001 Charlotte Ave Ste 200) - http://www.eatavo.com');
  });
});

test('hubot-foursquare-lunch missing configuration', async (t) => {
  let bot;

  before(async () => {
    Date.now = mockDateNow;
    // Create bot without the required env vars
    bot = await createTestBot();
    // Remove required config to test error messages
    delete process.env.HUBOT_DEFAULT_LATITUDE;
    delete process.env.HUBOT_DEFAULT_LONGITUDE;
    delete process.env.FOURSQUARE_CLIENT_ID;
    delete process.env.FOURSQUARE_CLIENT_SECRET;
  });

  after(async () => {
    Date.now = originalDateNow;
    bot.shutdown();
  });

  await t.test('responds with error messages', async () => {
    await bot.send('hubot lunch');
    assert.equal(bot.sends[0], 'Ensure that HUBOT_DEFAULT_LATITUDE is set.');
    assert.equal(bot.sends[1], 'Ensure that HUBOT_DEFAULT_LONGITUDE is set.');
    assert.equal(bot.sends[2], 'Ensure that FOURSQUARE_CLIENT_ID is set.');
    assert.equal(bot.sends[3], 'Ensure that FOURSQUARE_CLIENT_SECRET is set.');
  });
});
