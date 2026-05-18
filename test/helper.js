// Minimal drop-in replacement for hubot-test-helper that does not depend on
// hubot itself, avoiding its transitive vulnerabilities (cline,
// connect-multiparty, qs).
const path = require('path');

class MockRobot {
  constructor() {
    this.adapterName = 'shell';
    this.logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
    this._responders = [];
    this.messages = [];
  }

  respond(regex, callback) {
    this._responders.push({ regex, callback });
  }

  receive(user, text) {
    this.messages.push([user, text]);

    // Strip the bot mention prefix that hubot would normally remove before
    // matching against respond() patterns (e.g. "@hubot lunch" → "lunch").
    const stripped = text.replace(/^@?hubot[,:]?\s+/i, '');

    for (const { regex, callback } of this._responders) {
      const match = stripped.match(regex);
      if (match) {
        const robot = this;
        callback({
          match,
          send: (...strings) => {
            for (const s of strings) {
              robot.messages.push(['hubot', s]);
            }
          },
          random: (arr) => arr[Math.floor(Math.random() * arr.length)],
        });
        break;
      }
    }
  }
}

class Helper {
  constructor(scripts) {
    this._scripts = scripts;
  }

  createRoom() {
    const robot = new MockRobot();

    // Scripts are resolved relative to this file's directory (test/).
    for (const script of this._scripts) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const fn = require(path.resolve(__dirname, script));
      fn(robot);
    }

    return {
      robot,
      get messages() {
        return robot.messages;
      },
      user: {
        say: (user, text) => robot.receive(user, text),
      },
      destroy: () => {},
    };
  }
}

module.exports = Helper;
