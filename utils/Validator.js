const config = require("../config");

module.exports = class Validator {
  static validateConfiguration() {
    if (!config.TOKEN) {
      console.error("CONFIG: TOKEN ei voi olla tyhjä!");
      process.exit(1);
    }

    if (!config.MONGOURL) {
      console.error("CONFIG: MONGOURL ei voi olla tyhjä!");
      process.exit(1);
    }

    if (config.TICKETS.ENABLED) {
      if (!config.TICKETS.TICKETNAME) {
        console.error("CONFIG: TICKETS_TICKETNAME ei voi olla tyhjä!");
        process.exit(1);
      }
      if (!config.TICKETS.PARENT) {
        console.error("CONFIG: TICKETS_PARENT ei voi olla tyhjä!");
        process.exit(1);
      }
      if (!config.TICKETS.SUPPORTROOLI) {
        console.error("CONFIG: TICKETS_SUPPORTROOLI ei voi olla tyhjä!");
        process.exit(1);
      }
    }
    if (!config.ACTIVITY.ENABLED) {
      if (!config.ACTIVITY.MESSAGE) {
        console.error("CONFIG: ACTIVITY_MESSAGE ei voi olla tyhjä");
        process.exit(1);
      }
    }
  }
};
