const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ticketSchema = require("../../schemas/ticket");
const { COLOR, TICKETS } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setuppaa tiketit")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const { options, channel, guildId } = interaction;
    if (!TICKETS.ENABLED)
      return interaction.reply({
        content: `Ticketit ei ole edes käytössä!`,
        ephemeral: true,
      });
    const embed = new EmbedBuilder()
      .setTitle("Ticket")
      .setDescription('Paina "Avaa ticket" avataksesi tiketti')
      .setColor(COLOR);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create-ticket")
        .setLabel("Avaa ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
    interaction.reply({ content: `Ticket lähetetty!`, ephemeral: true });
  },
};
