const { model, Schema } = require("mongoose");

const ticketSchema = Schema({
  GuildID: String,
  MembersID: [String],
  TicketID: String,
  ChannelID: String,
  Closed: Boolean,
  OpenerID: String,
});

module.exports = model("Tickets", ticketSchema);
