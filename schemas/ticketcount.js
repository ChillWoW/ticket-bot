const { model, Schema } = require("mongoose");

const ticketSchema = Schema({
  GuildID: String,
  Count: 0,
});

module.exports = model("ticketcount", ticketSchema);
