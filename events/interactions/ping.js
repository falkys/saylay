
module.exports = {
    name: "interactionCreate",
    code: async (client, interaction) => {
        if (interaction.isCommand()) {
            if (interaction.commandName === "ping") {
                await interaction.reply({ content: `Ping`, ephemeral: true });

            }
        }
    }
};
