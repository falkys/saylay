const discord = require("discord.js");
const config = require("../../config.js");

module.exports = {
  name: "request",
  aliases: ["req", "r"],
  description: "Get's all Commmands, or one specific command",
  category: "Ticket",
  cooldown: 5,
  run: async (client, message, args) => {
    if (!message.guild.members.me.permissions.has("EmbedLinks"))
      return message.channel.send({
        content:
          "I do not have the **MESSAGE_EMBED_LINKS** permission in this channel.\nPlease enable it.",
      });
    if (
      !message.member.permissions.has(discord.PermissionsBitField.Flags.Administrator)
    ) {
      return message.channel.send({
        content:
          "Ты не админ",
      });
    }

    const prefix = config.prefix;
    if (args[0] == "setup") {
      const embed = new discord.EmbedBuilder()
        .setAuthor({
          name: `❯ ・ Requests`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("#FFF000")
        .setTimestamp()
        .setDescription(
          `~~————————————————~~
               Сообщение которое будет видеть участник,
               зайдите по ссылке: https://embed.dan.onl/,
               создайте макет сообщения и скопируйте JSON формат 
~~————————————————~~`
        )
        .setFooter({
          text: `Requested by ${message.author.username} |`,
          iconURL: message.author.displayAvatarURL({
            forceStatic: true,
          }),
        })
        .setImage(
          "https://cdn.discordapp.com/attachments/1393209163219472405/1393604183202074736/2025-07-12_174428.png?ex=6873c689&is=68727509&hm=1710fcba1a2496d4580072c48ec4afb17f4a8c01fdea70ed3eacf01aa6c4fb91&"
        );

      if (!args[1]) {
        return message.channel.send(
          `Укажите канал: ${prefix}request setup #channel`
        );
      }
      const channelId = args[1].replace(/[<#>]/g, "");
      const menu = new discord.ActionRowBuilder().addComponents(
        new discord.ButtonBuilder({
          custom_id: `request_setup:${channelId}`,
          label: "Сделать сообщение",
          style: discord.ButtonStyle.Success,
        })
      );
      return message.channel.send({
        embeds: [embed],
        components: [menu],
      });
    } else {
      const embed = new discord.EmbedBuilder()
        .setAuthor({
          name: `❯ ・ Requests`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor(config.color)
        .setTimestamp()
        .setDescription(
          `~~————————————————~~
               Напишите аргумент:
               ${prefix}request setup #channel
~~————————————————~~`
        )
        .setFooter({
          text: `Requested by ${message.author.username} |`,
          iconURL: message.author.displayAvatarURL({
            forceStatic: true,
          }),
        });

      return message.channel.send({
        embeds: [embed],
      });
    }
  },
};
