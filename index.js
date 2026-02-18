const prefix = "$";
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const badWords = ["madarchod", "bhosdike", "bsdk", "terimakichut", "chut", "chod", "madharchode", "randi", "behenkelund", "behen ke lode", "randd", "rand"];
  const inviteRegex = /(discord\.gg|discord\.com\/invite)/;
  const promoRegex = /(http[s]?:\/\/|www\.|t\.me|instagram\.com|youtube\.com)/;

  // 🔴 Abuse Filter
  if (badWords.some(word => message.content.toLowerCase().includes(word))) {
    await message.delete();
    await message.member.timeout(5 * 60 * 1000, "Abuse Language");

    return message.channel.send({
      content: `⚠️ ${message.author} Gali allowed nahi hai! Tumhe 5 minute ke liye mute kiya gaya hai.`
    });
  }

  // 🔴 Invite Link Block
  if (inviteRegex.test(message.content)) {
    await message.delete();
    await message.member.timeout(5 * 60 * 1000, "Invite Link");

    return message.channel.send({
      content: `⚠️ ${message.author} Invite link allowed nahi hai! Tumhe 5 minute ke liye mute kiya gaya hai.`
    });
  }

  // 🔴 Promo / External Links Block
  if (promoRegex.test(message.content)) {
    await message.delete();
    await message.member.timeout(5 * 60 * 1000, "Promotion Link");

    return message.channel.send({
      content: `⚠️ ${message.author} Promotion allowed nahi hai! Tumhe 5 minute ke liye mute kiya gaya hai.`
    });
  }

  if (message.content === "$ping") {
    message.reply("🏓 Pong!");
  }
});

// 🎤 TTS Command
  if (message.content.startsWith("$say ")) {
    if (!message.member.voice.channel) {
      return message.reply("❌ Pehle VC join karo.");
    }

    const text = message.content.slice(5);

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const tts = new gTTS(text, "en");
    const filePath = `./tts.mp3`;

    tts.save(filePath, function () {
      const player = createAudioPlayer();
      const resource = createAudioResource(filePath);

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        fs.unlinkSync(filePath);
      });
    });
  }
});

client.login(process.env.TOKEN);
