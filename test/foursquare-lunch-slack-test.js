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

test('hubot-foursquare-lunch for slack', async (t) => {
  let bot;

  before(async () => {
    Date.now = mockDateNow;
    bot = await createTestBot({ adapterName: 'slack' });
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
    assert.deepEqual(response, {
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
    });
  });

  await t.test('responds with a lunch location (random test)', async () => {
    bot.sends = [];
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

    const response = await bot.sendAndWaitForResponse('hubot lunch');
    assert.equal(typeof response, 'object');
    assert.ok(response.attachments, 'should have attachments');
    assert.ok(response.attachments[0].title, 'should have title');
    assert.ok(response.attachments[0].title_link, 'should have title_link');
    assert.ok(response.attachments[0].fallback, 'should have fallback');
    assert.ok(response.attachments[0].fields, 'should have fields');
  });
});
