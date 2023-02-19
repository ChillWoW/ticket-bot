const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ticketSchema = require("../../schemas/ticket");
const { COLOR, TICKETS } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Lisää käyttäjä tikettiin")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option
        .setName("käyttäjä")
        .setDescription("Käyttäjä joka lisätään tikettiin")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const { options, channel, guildId } = interaction;
    if (!TICKETS.ENABLED)
      return interaction.reply({
        content: `Tiketit ei ole edes käytössä!`,
        ephemeral: true,
      });
    const member = options.getUser("käyttäjä");

    await ticketSchema.findOne(
      { GuildID: guildId, ChannelID: channel.id },
      async (err, data) => {
        if (err) throw err;
        if (!data)
          return interaction.reply({
            content: `Tikettiä ei löytynyt databasesta!`,
            ephemeral: true,
          });
        if (data.MembersID.includes(member.id))
          return interaction.reply({
            content: `Käyttäjä on jo lisätty tikettiin!`,
            ephemeral: true,
          });
        interaction.deferReply(interaction.deleteReply());
        try {
          channel.permissionOverwrites
            .edit(member, {
              [PermissionFlagsBits.ViewChannel]: true,
              [PermissionFlagsBits.SendMessages]: true,
            })
            .then(() => {
              const embed = new EmbedBuilder()
                .setDescription(
                  `Lisätty henkilö ${member} kanavalle ${channel}`
                )
                .setColor(COLOR);
              channel.send({ embeds: [embed] });
            });
          data.MembersID.push(member.id);
          data.save();
        } catch (err) {
          console.log(err);
          await interaction.reply({
            content: `Jokin meni pieleen! Yritä myöhemmiin uudelleen`,
            ephemeral: true,
          });
        }
      }
    );
  },
};
