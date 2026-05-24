const path = require('path');
const { Robot, TextMessage } = require('hubot');
const nock = require('nock');
const script = require('../../src/foursquare-lunch');

class TestBotContext {
  constructor(robot, user) {
    this.robot = robot; this.user = user;
    this.sends = []; this.replies = [];
    this.robot.adapter.on('send', (_, strings) => this.sends.push(strings.length === 1 ? strings[0] : strings.join('\n')));
    this.robot.adapter.on('reply', (_, strings) => this.replies.push(strings.length === 1 ? strings[0] : strings.join('\n')));
    this.nock = nock;
  }

  async send(message) {
    const id = (Math.random() + 1).toString(36).substring(7);
    this.robot.adapter.receive(new TextMessage(this.user, message, id));
    await new Promise((done) => { setTimeout(done, 50); });
  }

  async sendAndWaitForResponse(message, responseType = 'send') {
    return new Promise((done) => {
      this.robot.adapter.once(responseType, (_, strings) => done(strings[0]));
      this.send(message);
    });
  }

  shutdown() {
    delete process.env.FOURSQUARE_CLIENT_ID;
    delete process.env.FOURSQUARE_CLIENT_SECRET;
    delete process.env.HUBOT_DEFAULT_LATITUDE;
    delete process.env.HUBOT_DEFAULT_LONGITUDE;
    delete process.env.FOURSQUARE_PRICE_LEVELS;
    delete process.env.FOURSQUARE_SEARCH_METERS;
    delete process.env.FOURSQUARE_SEARCH_QUERY;
    nock.cleanAll();
    this.robot.shutdown();
  }
}

async function createTestBot(settings = {}) {
  process.env.HUBOT_LOG_LEVEL = 'silent';
  process.env.FOURSQUARE_CLIENT_ID = 'foobar1';
  process.env.FOURSQUARE_CLIENT_SECRET = 'foobar2';
  process.env.HUBOT_DEFAULT_LATITUDE = '36.1514179';
  process.env.HUBOT_DEFAULT_LONGITUDE = '-86.8262359';
  nock.cleanAll();
  nock.disableNetConnect();
  const robot = new Robot(path.resolve(__dirname, 'adapter'), false, 'hubot');
  await robot.loadAdapter(path.resolve(__dirname, 'adapter.js'));
  script(robot);
  return new Promise((done) => {
    robot.adapter.on('connected', () => {
      if (settings.adapterName) robot.adapterName = settings.adapterName;
      const user = robot.brain.userForId('1', { name: 'testuser', room: '#testroom' });
      done(new TestBotContext(robot, user));
    });
    robot.run();
  });
}

module.exports = { createTestBot, TestBotContext };
