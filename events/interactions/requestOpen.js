const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");

const { send } = require("../../Utils/rcon");
const { channelLog, roleId } = require("../../config");
module.exports = {
  name: "interactionCreate",
  code: async (client, interaction) => {
    try {
      if (interaction.isButton()) {
        const [action, data] = interaction.customId.split(":");

        if (action === "request_create") {
          const modal = new ModalBuilder()
            .setCustomId(`requestModalCreate`)
            .setTitle("Оставить заявку");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("request_create_nickname")
                .setLabel("Ваш никнейм в майнкрафте")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(4)
                .setMaxLength(30)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("request_create_description")
                .setLabel("Раскажите о себе подробно")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(100)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("request_create_age")
                .setLabel("Сколько вам лет")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(2)
            )
          );
          await interaction.showModal(modal);
        } else if (action === "request_accept") {
          const [nick, userId] = data.split("_");
          (async () => {
            await interaction.deferReply({ ephemeral: true });
            try {
              if (
                !interaction.guild.members.me.permissions.has(
                  PermissionsBitField.Flags.ManageRoles
                )
              ) {
                return interaction.editReply({
                  content: "❌ У меня нет прав для выдачи ролей.",
                });
              }
              const response2 = await send(`whitelist add ${nick}`);

              if (response2 === "Player is already whitelisted") {
                return interaction.editReply({
                  content: "Игрок уже добавлен",
                });
              }
              const role = interaction.guild.roles.cache.get(roleId);
              const member = await interaction.guild.members.fetch(userId);
              await member.roles.add(role);
              const user = await client.users.fetch(userId);
              await user.send(
                "Поздравляем тебя добавили в вайтлист сервера: ip: may.saylay.online"
              );
              await interaction.editReply({
                content: `Успех, ответ: ${response2}`,
              });
            } catch (err) {
              client.logger.log(`Ошибка ${err}`, "rcon")
              const isServerOff = err.message.includes("ECONNREFUSED");
              const isRconPass = err.message.includes("Authentication failed");
              if (isServerOff) {
                return interaction.editReply({
                  content: "Ошибка, сервер выключен",
                });
              }
              if (isRconPass) {
                return interaction.editReply({
                  content: "Ошибка, провал авторизации Rcon",
                });
              }
              return interaction.editReply({
                content: "Ошибка, проверьте консоль бота",
              });
            }
          })();
        }
        if (action === "request_decline") {
          const [nick, userId] = data.split("_");
          const user = await client.users.fetch(userId);
          await user.send("К сожеления ты не прошел в вайтлист 😔");
          interaction.reply({ content: "Отправленно", ephemeral: true });
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === "requestModalCreate") {
          const nickname = interaction.fields.getTextInputValue(
            "request_create_nickname"
          );
       
          const age =
            interaction.fields.getTextInputValue("request_create_age");
          const description = interaction.fields.getTextInputValue(
            "request_create_description"
          );

          if (!channelLog) {
            return interaction.reply({
              content: `Укажите канал где будут приходить заявки в конфиге`,
            });
          }
          const channel = client.channels.cache.get(channelLog);
          if (!channel) {
            return interaction.reply({
              content: "Произошла ошибка: канал для логов не найден.",
              ephemeral: true,
            });
          }
          const embed = new EmbedBuilder()
            .setTitle("Заявка в вайтлист")
            .addFields(
              { name: "Никнейм", value: nickname, inline: true },
              { name: "Описание", value: description, inline: true },
              { name: "Возраст", value: age, inline: true }
            )
            .setTimestamp()
            .setColor("#32a852");
          const buttons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder({
                custom_id: `request_accept:${nickname}_${interaction.user.id}`,
                label: "Принять",
                style: ButtonStyle.Success,
                emoji: "✅",
              })
            )
            .addComponents(
              new ButtonBuilder({
                custom_id: `request_decline:${nickname}_${interaction.user.id}`,
                label: "Отклонить",
                style: ButtonStyle.Danger,
                emoji: "❎",
              })
            );
          channel.send({ embeds: [embed], components: [buttons] });
          interaction.reply({
            content: "Успешно отправленно, ждите одобрения",
            ephemeral: true,
          });
        }
      }
    } catch (err) {
      console.error("Ошибка в interactionCreate:", err);
      if (interaction.replied === false && interaction.deferred === false) {
        await interaction.reply({
          content: "Произошла ошибка при выполнении действия.",
          ephemeral: true,
        });
      }
    }
  },
};
