# Hubot Foursquare Lunch

[![npm version](https://badge.fury.io/js/hubot-foursquare-lunch.svg)](http://badge.fury.io/js/hubot-foursquare-lunch) [![Build Status](https://travis-ci.org/stephenyeargin/hubot-foursquare-lunch.png)](https://travis-ci.org/stephenyeargin/hubot-foursquare-lunch)

Use Foursquare API to pick a lunch spot.

## How to Set Up the Bot User

1. Register a Foursquare application to obtain your `FOURSQUARE_CLIENT_ID` and `FOURSQUARE_CLIENT_SECRET`
2. Authenticate either your personal foursquare account or a purpose-specific user that acts as your bot
3. Manually walk through the OAuth process to obtain a `FOURSQUARE_ACCESS_TOKEN` (this can be tricky)

When you have all three values, load them as environment variables for launching your Hubot. If you are installing via Heroku, you would enter:

```
$ heroku set:config FOURSQUARE_CLIENT_ID=yourclientid
$ heroku set:config FOURSQUARE_CLIENT_SECRET=yourclientsecret
$ heroku set:config FOURSQUARE_ACCESS_TOKEN=youraccesstoken
$ heroku set:config HUBOT_DEFAULT_LATITUDE=yourcoordinates
$ heroku set:config HUBOT_DEFAULT_LONGITUDE=yourcoordinates
```

If you are using some other hosting/launcher, make sure the variables above are loaded in appropriately.

## Adding Module to Your Hubot

See full instructions [here](https://github.com/github/hubot/blob/master/docs/scripting.md#npm-packages).

1. `npm install hubot-foursquare-lunch --save` (updates your `package.json` file)
2. Open the `external-scripts.json` file in the root directory (you may need to create this file) and add an entry to the array (e.g. `[ 'hubot-foursquare-lunch' ]`).

## Usage

### Get All Recent Checkins

* `hubot lunch`
* Returns a random nearby lunch spot
