// Description:
//   Use Foursquare API to pick a lunch spot
//
// Configuration:
//   HUBOT_DEFAULT_LATITUDE - Latitude in decimal format, e.g. `36.1514179`
//   HUBOT_DEFAULT_LONGITUDE - Longitude in decimal format, e.g. `-86.8262359`
//   FOURSQUARE_CLIENT_ID - The Client ID for your application
//   FOURSQUARE_CLIENT_SECRET - The Client Secret for your application
//   FOURSQUARE_PRICE_LEVELS - Comma-separated price levels, 1-4 (default: `1,2,3`)
//   FOURSQUARE_SEARCH_QUERY - The search query to use (default: `lunch`)
//   FOURSQUARE_SEARCH_METERS - The search radius from your location (default: `1600`)
//
// Commands:
//   hubot lunch - Pick a random lunch spot.
//
// Author:
//   stephenyeargin

const config = {
  secrets: {
    clientId: process.env.FOURSQUARE_CLIENT_ID,
    clientSecret: process.env.FOURSQUARE_CLIENT_SECRET,
    redirectUrl: 'localhost',
  },
};
config.foursquare = {
  mode: 'foursquare',
  version: '20140806',
};

// Configure debugger based on log level
if (process.env.HUBOT_LOG_LEVEL != null) {
  config.winston = {
    loggers: {
      core: {
        console: {
          level: process.env.HUBOT_LOG_LEVEL,
        },
      },
    },
  };
}
const foursquareClient = require('node-foursquare')(config);

module.exports = (robot) => {
  // Handle error
  const handleError = (err, msg) => {
    robot.logger.error(err);
    msg.send(err);
  };

  // Check for required config
  const missingConfiguration = (msg) => {
    let isMissingConfiguration = false;
    if (process.env.HUBOT_DEFAULT_LATITUDE == null) {
      handleError('Ensure that HUBOT_DEFAULT_LATITUDE is set.', msg);
      isMissingConfiguration = true;
    }
    if (process.env.HUBOT_DEFAULT_LONGITUDE == null) {
      handleError('Ensure that HUBOT_DEFAULT_LONGITUDE is set.', msg);
      isMissingConfiguration = true;
    }
    if (process.env.FOURSQUARE_CLIENT_ID == null) {
      handleError('Ensure that FOURSQUARE_CLIENT_ID is set.', msg);
      isMissingConfiguration = true;
    }
    if (process.env.FOURSQUARE_CLIENT_SECRET == null) {
      handleError('Ensure that FOURSQUARE_CLIENT_SECRET is set.', msg);
      isMissingConfiguration = true;
    }
    return isMissingConfiguration;
  };

  // Find lunch spots
  const suggestLunchSpot = (msg) => {
    if (missingConfiguration(msg)) { return; }

    // Geolocation
    const lat = process.env.HUBOT_DEFAULT_LATITUDE;
    const lon = process.env.HUBOT_DEFAULT_LONGITUDE;

    // Parameters
    const params = {
      price: process.env.FOURSQUARE_PRICE_LEVELS || '1,2,3',
      query: process.env.FOURSQUARE_SEARCH_QUERY || 'lunch',
      radius: process.env.FOURSQUARE_SEARCH_METERS || 1600,
      openNow: true,
    };

    // Call Foursquare API
    foursquareClient.Venues.explore(lat, lon, false, params, null, (err, res) => {
      if (err != null) {
        handleError(err, msg);
        return;
      }

      robot.logger.debug(res);

      if (res.groups[0].items.length === 0) {
        msg.send('Did not find any nearby lunch spots.');
        return;
      }

      const spot = msg.random(res.groups[0].items);
      robot.logger.debug(spot);

      const payload = {
        fallback: spot.venue.name,
        title: spot.venue.name,
        title_link: `https://foursquare.com/v/${spot.venue.id}`,
        fields: [],
      };

      // Address
      if (spot.venue.location.address != null) {
        const {
          address,
        } = spot.venue.location;
        payload.fallback = `${payload.fallback} (${address})`;
        payload.fields.push({
          title: 'Address',
          value: `${address}`,
          short: true,
        });
      }

      // Menu
      if (spot.venue.menu != null) {
        payload.fields.push({
          title: 'Menu',
          value: `<${spot.venue.menu.url}|View Menu>`,
          short: true,
        });
      }

      // Website
      if (spot.venue.url != null) {
        payload.fallback = `${payload.fallback} - ${spot.venue.url}`;
        payload.fields.push({
          title: 'Website',
          value: `${spot.venue.url}`,
          short: true,
        });
      }

      // Rating
      if (spot.venue.rating != null) {
        if (spot.venue.rating.toFixed(1) <= 5) {
          payload.color = 'danger';
        }
        if (spot.venue.rating.toFixed(1) <= 7) {
          payload.color = 'warning';
        }
        if (spot.venue.rating.toFixed(1) <= 10) {
          payload.color = 'good';
        }
        payload.fields.push({
          title: 'Rating',
          value: `${spot.venue.rating} out of 10`,
          short: true,
        });
      }

      // Category
      if (spot.venue.categories.length > 0) {
        const cat = spot.venue.categories[0];
        payload.thumb_url = `${cat.icon.prefix}bg_120${cat.icon.suffix}`;
        payload.fields.push({
          title: 'Category',
          value: `${cat.shortName}`,
          short: true,
        });
      }

      // Price
      if (spot.venue.price != null) {
        payload.fields.push({
          title: 'Price',
          value: `${spot.venue.price.message}`,
          short: true,
        });
      }

      switch (robot.adapterName) {
        case 'slack':
          msg.send({
            attachments: [payload],
            unfurl_links: false,
          });
          break;
        default:
          msg.send(payload.fallback);
      }
    });
  };

  // Main responder
  robot.respond(/lunch$/i, (msg) => suggestLunchSpot(msg));
};
