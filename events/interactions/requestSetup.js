const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} = require("discord.js");
module.exports = {
  name: "interactionCreate",
  code: async (client, interaction) => {
    try {
    if (interaction.isButton()) {
      const [action, data] = interaction.customId.split(":");
      if (action === "request_setup") {
        const modal = new ModalBuilder()
          .setCustomId(`requestModal:${data}`)
          .setTitle("Создать сообщение");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("request_embed_json")
              .setLabel("JSON формат сообщения")
              .setStyle(TextInputStyle.Paragraph) 
              .setRequired(true)
              .setMinLength(4)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("request_embed_button_text")
              .setLabel("Текст кнопки")
              .setStyle(TextInputStyle.Short) 
              .setRequired(true)
              .setMinLength(4)
          )
        );
        await interaction.showModal(modal);
      }
    }

    if (interaction.isModalSubmit()) {
        const [modalId, data] = interaction.customId.split(":");

        if (modalId === "requestModal") {
          const rawJson = interaction.fields.getTextInputValue("request_embed_json");
          const buttontext = interaction.fields.getTextInputValue("request_embed_button_text");

          let parsedJson;
          try {
            parsedJson = JSON.parse(rawJson);
          } catch (e) {
            return interaction.reply({
              content: "Невозможно распарсить JSON. Убедитесь, что формат правильный.",
              ephemeral: true
            });
          }
          if (typeof parsedJson.color === "string" && parsedJson.color.startsWith("#")) {
            parsedJson.color = parseInt(parsedJson.color.replace("#", ""), 16);
          }

          if (parsedJson.timestamp && typeof parsedJson.timestamp === "number") {
            parsedJson.timestamp = new Date(parsedJson.timestamp).toISOString();
          }

          const embed = new EmbedBuilder(parsedJson);

          const channel = client.channels.cache.get(data);
          if (!channel) {
            return interaction.reply({
              content: "Произошла ошибка: канал не найден.",
              ephemeral: true
            });
          }

          const menu = new ActionRowBuilder().addComponents(
            new ButtonBuilder({
              custom_id: `request_create`,
              label: buttontext,
              style: ButtonStyle.Success
            })
          );

          await channel.send({
            embeds: [embed],
            components: [menu]
          });

          await interaction.reply({ content: "Сообщение успешно отправлено!", ephemeral: true });
        }
      }
    } catch (err) {
      console.error("Ошибка в interactionCreate:", err);
      if (interaction.replied === false && interaction.deferred === false) {
        await interaction.reply({
          content: "Произошла ошибка при выполнении действия.",
          ephemeral: true
        });
      }
    
  }
  }
  
};
