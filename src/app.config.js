const { withAndroidGoogleServicesFile } = require('@expo/config-plugins');

// Use EAS file secret path if available, otherwise fall back to local file
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || './google-services.json';

/** @type {import('expo/config').ExpoConfig} */
const config = require('./app.json').expo;

module.exports = {
  expo: {
    ...config,
    android: {
      ...config.android,
      googleServicesFile,
    },
  },
};
