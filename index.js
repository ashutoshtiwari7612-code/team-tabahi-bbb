const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes 
} = require("discord.js");

const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require("@discordjs/voice");

const gTTS = require("gtts");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection = null;

// 🔥 Abuse Words
const badWords = [
  "madarchod", "bhosdike", "bsdk", "terimakichut",
  "chut", "chod", "madharchode", "randi",
  "behenkelund", "behen ke lode", "randd", "rand"
];

// 🔥 Invite / Promo
const inviteRegex = /(discord\.gg|discord\.com\/invite)/i;
const promoRegex = /(http[s]?:\/\/|www\.|t\.me|instagram\.com|youtube\.com)/i;


// ✅ READY
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const commands = [

    new SlashCommandBuilder()
      .setName("join")
      .setDescription("Join your voice channel"),

    new SlashCommandBuilder()
      .setName("leave")
      .setDescription("Leave voice channel"),

    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check bot latency")

  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("Slash commands registered");
});


// ✅ SLASH COMMANDS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "join") {

    if (!interaction.member.voice.channel) {
      return interaction.reply("❌ Pehle VC join karo.");
    }

    connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    return interaction.reply("🎤 VC join kar liya.");
  }

  if (interaction.commandName === "leave") {

    if (!connection) {
      return interaction.reply("❌ VC me nahi hoon.");
    }

    connection.destroy();
    connection = null;

    return interaction.reply("👋 VC leave kar diya.");
  }

  if (interaction.commandName === "ping") {
    return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

});


// ✅ MESSAGE SYSTEM
client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // 🔥 Moderation
  if (
    badWords.some(word => content.includes(word)) ||
    inviteRegex.test(content) ||
    promoRegex.test(content)
  ) {
    await message.delete().catch(() => {});

    try {
      await message.member.timeout(5 * 60 * 1000, "Rule Violation");
    } catch {}

    return message.channel.send(`⚠️ ${message.author} Yeh allowed nahi hai! 5 minute mute.`);
  }

  // 🔥 Auto VC TTS
  if (connection && message.content.length > 0) {

    const tts = new gTTS(message.content, "en");
    const filePath = "./tts.mp3";

    tts.save(filePath, function () {

      const player = createAudioPlayer();
      const resource = createAudioResource(filePath);

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

    });
  }

});

client.login(process.env.TOKEN);
