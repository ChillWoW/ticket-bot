const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { TICKETS, COLOR } = require("../../config");
const ticketCount = require("../../schemas/ticketcount");
const ticketSchema = require("../../schemas/ticket");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const { customId, guild, guildId, user, channel, message } = interaction;
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        interaction.reply({ content: "outdated command" });
      }

      command.execute(interaction, client);
    } else if (interaction.isButton()) {
      switch (customId) {
        case "create-ticket":
          await interaction.deferReply({
            ephemeral: true,
          });
          let ticketName;
          if (TICKETS.TICKETNAME == "count") {
            await ticketCount.findOne(
              { GuildID: guildId },
              async (err, data) => {
                if (err) throw err;
                if (!data) {
                  await ticketCount.create({
                    GuildID: guildId,
                    Count: 0,
                  });
                  return interaction.editReply({
                    content: `Serveri rekisteröity databaseen. Tiketti toimii nyt`,
                    ephemeral: true,
                  });
                }
                data.Count++;
                data.save();
                ticketName = data.Count;
              }
            );
          } else if (TICKETS.TICKETNAME == "discordid") {
            ticketName = user.id;
          } else if (TICKETS.TICKETNAME == "discordname") {
            ticketName = user.username;
          };
          guild.channels
            .create({
              name: `ticket-${ticketName}`,
              parent: `${TICKETS.PARENT}`,
              permissionOverwrites: [
                {
                  id: user.id,
                  allow: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                  ],
                },
                {
                  id: TICKETS.SUPPORTROOLI,
                  allow: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                  ],
                },
                {
                  id: guild.roles.everyone,
                  deny: [PermissionFlagsBits.ViewChannel],
                },
              ],
            })
            .then(async (channel) => {
              if (TICKETS.TICKETNAME == "count") {
                await ticketSchema.create({
                  GuildID: guildId,
                  MembersID: user.id,
                  TicketID: ticketName,
                  ChannelID: channel.id,
                  Closed: false,
                  OpenerID: user.id,
                });
              } else {
                await ticketSchema.create({
                  GuildID: guildId,
                  MembersID: user.id,
                  ChannelID: channel.id,
                  Closed: false,
                  OpenerID: user.id,
                });
              }
              const openedEmbed = new EmbedBuilder()
                .setDescription(
                  "Ylläpito ottaa sinun yhteyttä piakkoin. Sulkeaksesi tiketin paina 🔒"
                )
                .setColor(COLOR);
              const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("close-ticket")
                  .setLabel("Sulje")
                  .setEmoji("🔒")
                  .setStyle(ButtonStyle.Secondary)
              );
              channel.send({
                content: `<@${user.id}>`,
                embeds: [openedEmbed],
                components: [buttons],
              });

              interaction.editReply({
                content: `Tiketti avattu <#${channel.id}>`,
                ephemeral: true,
              });
            });
          break;
        case "close-ticket":
          await ticketSchema.findOne(
            { GuildID: guildId, ChannelID: channel.id },
            async (err, data) => {
              if (err) throw err;
              if (!data)
                return interaction.reply({
                  content: `Tikettiä ei löytynyt databasesta!`,
                  ephemeral: true,
                });

              await interaction.deferReply(interaction.deleteReply());

              if (data.Closed)
                return interaction.reply({
                  content: `Tiketti on jo suljettu!`,
                  ephemeral: true,
                });

              const closedEmbed = new EmbedBuilder()
                .setDescription(`Tiketti suljettu! Sulkija <@${user.id}>`)
                .setColor(COLOR);
              await channel.send({ embeds: [closedEmbed] });

              const supportEmbed = new EmbedBuilder()
                .setDescription("```YLLÄPITO```")
                .setColor(COLOR);

              const supportButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("transcript-ticket")
                  .setLabel("Transcript")
                  .setEmoji("📑")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("reopen-ticket")
                  .setLabel("Avaa")
                  .setEmoji("🔓")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("delete-ticket")
                  .setLabel("Poista")
                  .setEmoji("⛔")
                  .setStyle(ButtonStyle.Secondary)
              );
              channel.send({
                embeds: [supportEmbed],
                components: [supportButtons],
              });
              data.Closed = true;
              data.save();

              channel
                .edit({ name: `closed-${channel.name}` })
                .then(async () => {
                  data.MembersID.forEach((m) => {
                    channel.permissionOverwrites.edit(m, {
                      SendMessages: false,
                      ViewChannel: false,
                    });
                  });
                });
            }
          );
          break;
        //YLLÄPITO CONTROLLIT
        case "transcript-ticket":
          const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: "attachment",
            returnBuffer: false,
            fileName: `${channel.name}.html`,
          });
          await interaction.reply({ files: [transcript] });
          break;
        case "reopen-ticket":
          ticketSchema.findOne(
            { GuildID: guildId, ChannelID: channel.id },
            async (err, data) => {
              if (err) throw err;
              if (!data)
                return interaction.reply({
                  content: `Tikettiä ei löytynyt databasesta!`,
                  ephemeral: true,
                });

              const name = `${channel.name}`.replace("closed-", "");
              channel.edit({ name: name }).then(async (channel) => {
                const openerEmbed = new EmbedBuilder()
                  .setDescription(`Tiketti avattu! Avaaja <@${user.id}>`)
                  .setColor(COLOR);
                channel.send({ embeds: [openerEmbed] });
                message.delete();
                data.MembersID.forEach((m) => {
                  channel.permissionOverwrites.edit(m, {
                    SendMessages: true,
                    ViewChannel: true,
                  });
                });
              });

              data.Closed = false;
              data.save();
            }
          );
          break;
        case "delete-ticket":
          const deleteEmbed = new EmbedBuilder()
            .setDescription("Tiketti suljetaan viiden sekunnin kuluttua")
            .setColor(COLOR);

          await ticketSchema.findOneAndDelete(
            {
              GuildID: guildId,
              ChannelID: channel.id,
            },
            async (err, data) => {
              if (err) throw err;
              if (!data)
                return interaction.reply({
                  content: `Tikettiä ei löytynyt databasesta!`,
                  ephemeral: true,
                });
              setTimeout(() => {
                channel.delete();
              }, 5000);
              interaction.reply({ embeds: [deleteEmbed] });

              const transcript = await createTranscript(channel, {
                limit: -1,
                returnType: "attachment",
                returnBuffer: false,
                fileName: `${channel.name}.html`,
              });

              const member = client.users.cache.get(data.OpenerID);

              const memberEmbed = new EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                .setColor(COLOR)
              if (data.TicketID) {
                memberEmbed.addFields(
                  { name: `Ticket ID`, value: data.TicketID, inline: true },
                );
              }
              memberEmbed.addFields(
                { name: `Opened By`, value: `<@${member.id}>`, inline: true },
                { name: `Closed By`, value: `<@${user.id}>`, inline: true }
              );

              await member
                .send({ embeds: [memberEmbed], files: [transcript] })
                .catch(() => {
                  console.log(
                    "Viestiä ei voitu lähettää henkilölle: " + member.id
                  );
                });
            }
          );
          break;
      }
    } else {
      return;
    }
  },
};
