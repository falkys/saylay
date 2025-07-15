require('dotenv').config({ path: '.env', override: true });

const discord = require("discord.js");
const client = new discord.Client({
    closeTimeout: 3_000 ,
    waitGuildTimeout: 15_000,
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildVoiceStates,
        discord.GatewayIntentBits.GuildPresences,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.GuildMessageTyping,
        discord.GatewayIntentBits.MessageContent
    ],
    allowedMentions: {
        parse: ["users"],
        repliedUser: true
    },
    makeCache: discord.Options.cacheWithLimits({
		...discord.Options.DefaultMakeCacheSettings,
		ReactionManager: 0,
        GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: member => member.id === client.user.id,
		}
	}),
});


client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.cooldowns = new discord.Collection();
client.events = new discord.Collection();
client.logger = require('./Utils/logger');
["commands", "events"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

(async () => {
  try {
    await client.login(process.env.token);
  } catch (err) {
    client.logger.log("Invalid TOKEN!", "warn");
    console.error("❌ Ошибка входа:", err.message);
  }
})();


