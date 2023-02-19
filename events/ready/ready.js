const { ActivityType } = require("discord.js");
const { ACTIVITY } = require("../../config");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`${client.user.username} päällä!`);

    if (ACTIVITY.ENABLED) {
      const getType = (type) => {
        switch (type) {
          case "COMPETING":
            return ActivityType.Competing;

          case "LISTENING":
            return ActivityType.Listening;

          case "PLAYING":
            return ActivityType.Playing;

          case "WATCHING":
            return ActivityType.Watching;
        }
      };

      client.user.setPresence({
        status: ACTIVITY.STATUS,
        activities: [
          {
            name: ACTIVITY.MESSAGE,
            type: getType(ACTIVITY.TYPE),
          },
        ],
      });
    }
  },
};