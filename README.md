# Hubot Foursquare Lunch

[![npm version](https://badge.fury.io/js/hubot-foursquare-lunch.svg)](http://badge.fury.io/js/hubot-foursquare-lunch) [![Build Status](https://app.travis-ci.com/stephenyeargin/hubot-foursquare-lunch.png)](https://app.travis-ci.com/stephenyeargin/hubot-foursquare-lunch)

Use Foursquare API to pick a lunch spot.

## Configuration

1. [Register a Foursquare application](https://apps.foursquare.com) to obtain your `FOURSQUARE_CLIENT_ID` and `FOURSQUARE_CLIENT_SECRET`.
2. Find your `HUBOT_DEFAULT_LATITUDE` and `HUBOT_DEFAULT_LONGITUDE` values using [Google Maps](https://maps.google.com) or another tool.

| Configuration Variable     | Required | Description                |
| -------------------------- | :------: | -------------------------- |
| `HUBOT_DEFAULT_LATITUDE`   | **Yes**  | Latitude in decimal format, e.g. `36.1514179` |
| `HUBOT_DEFAULT_LONGITUDE`  | **Yes**  | Longitude in decimal format, e.g. `-86.8262359` |
| `FOURSQUARE_CLIENT_ID`     | **Yes**  | The Client ID for your application |
| `FOURSQUARE_CLIENT_SECRET` | **Yes**  | The Client Secret for your application |
| `FOURSQUARE_PRICE_LEVELS`  | No       | Comma-separated price levels, 1-4 (default: `1,2,3`) |
| `FOURSQUARE_SEARCH_QUERY`  | No       | The search query to use (default: `lunch`) |
| `FOURSQUARE_SEARCH_METERS` | No       | The search radius from your location (default: `1600`) |

## Installing

See full instructions [here](https://github.com/github/hubot/blob/master/docs/scripting.md#npm-packages).

1. `npm install hubot-foursquare-lunch --save` (updates your `package.json` file)
2. Open the `external-scripts.json` file in the root directory (you may need to create this file) and add an entry to the array (e.g. `[ 'hubot-foursquare-lunch' ]`).

## Usage

```
alice> hubot lunch
hubot> Bob's Burgers (103 Ocean Avenue) - http://www.fox.com/Shows/Bobs-Burgers
```
