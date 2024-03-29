const Discord = require("discord.js");
const fs = require("fs");
const { Client } = require("discord.js");
const db = require("quick.db");
const colors = require("colors");
const format = require(`humanize-duration`);
const ms = require("pretty-ms");
const canvacord = require("canvacord");
const mongoose = require("mongoose");
const { MessageEmbed } = require("discord.js");
const client = new Client({
  disableEveryone: "everyone",
  partials: ["REACTION", "MESSAGE", "CHANNEL"]
});
require("./reply"); //<message.inlineReply>
const {
  Default_Prefix,
  Token,
  Support,
  id,
  Color,
  mongodb,
  Server_ID,
  DateDat,
  Dashboard
} = require("./config.js");
const fetch = require("node-fetch");
setInterval(async () => {
  await fetch("https://grandiose-crocus-geograph.glitch.me/");
}, 240000);
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.queue = new Map();

client.config = require("./emoji/emojis");
let { awaitReply } = require("./Functions.js");
client.emotes = client.config.emojis;
client.db = require("quick.db");
client.discord = require("discord.js");
client.resolveUser = resolveUser;
client.awaitReply = awaitReply;
client.random = getRandomString;

client.on("ready", async () => {
  fetch(`https://skybotlistpr.glitch.me/api/bots/stats`, {
    method: "POST",
    headers: {
      serverCount: client.guilds.cache.size,
      "Content-Type": "application/json",
      Authorization: "yhiJwowjQneauWvPaZnDfGHY"
    }
  }).then(console.log("Server count posted."));

  console.clear();
  console.log(`Bot Is Ready To Go!\nTag: ${client.user.tag}`);
  client.user
    .setPresence({
      activity: {
        type: "WATCHING",
        name: `Commands: ${Default_Prefix}help\n ${client.guilds.cache.size} Server | ${client.users.cache.size} User`
      },
      status: "idle"
    })
    .then(console.log)
    .catch(console.error);
});

const { readdirSync } = require("fs");
readdirSync("./commands/").forEach(dir => {
  const commands = readdirSync(`./commands/${dir}/`).filter(file =>
    file.endsWith(".js")
  );
  for (let file of commands) {
    let command = require(`./commands/${dir}/${file}`);
    console.log(`${command.category}|${command.name} Has Been Loaded - ✅`);
    if (command.name) client.commands.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach(alias => client.aliases.set(alias, command.name));
    }
  }
});
for (let file of fs.readdirSync("./events/")) {
  if (file.endsWith(".js")) {
    let fileName = file.substring(0, file.length - 3);
    let fileContents = require(`./events/${file}`);
    fileContents(client);
    const description = {
      name: fileName,
      filename: file,
      version: `4.8`
    };
    console.log(
      `⬜️ Module: ${description.name} | Loaded version ${description.version} | form("${description.filename}")`
    );
  }
}
//-------------------------------------------- S N I P E -------------------------------------------

client.snipe = new Map();
client.on("messageDelete", function(message, channel) {
  client.snipe.set(message.channel.id, {
    content: message.content,
    author: message.author.username,
    image: message.attachments.first()
      ? message.attachments.first().proxyURL
      : null
  });
});

//-------------------------------------------- A N T I  S W E A R -------------------------------------------

client.on("message", async message => {
  if (message.author.bot || !message.guild || message.webhookID) return;

  let words = db.get(`words_${message.guild.id}`);
  let yus = db.get(`message_${message.guild.id}`);
  if (yus === null) {
    yus = ":x: | **{user-mention}, The Word You said is blacklisted!**";
  }
  let Prefix = await db.get(`Prefix_${message.guild.id}`);
  if (!Prefix) Prefix = Default_Prefix;
  if (message.content.startsWith(Prefix + "addword")) return;
  if (message.content.startsWith(Prefix + "delword")) return;
  if (message.content.startsWith(Prefix + "set-warn-msg")) return;
  if (message.content.startsWith(Prefix + "words")) return;
  let pog = yus
    .split("{user-mention}")
    .join("<@" + message.author.id + ">")
    .split("{server-name}")
    .join(message.guild.name)
    .split("{user-tag}")
    .join(message.author.tag)
    .split("{user-username}")
    .join(message.author.username);
  if (words === null) return;
  function check(msg) {
    //is supposed to check if message includes da swear word
    return words.some(word =>
      message.content
        .toLowerCase()
        .split(" ")
        .join("")
        .includes(word.word.toLowerCase())
    );
  }
  if (check(message.content) === true) {
    message.delete();
    message.channel
      .send(pog)
      .then(m => m.delete({ timeout: 5000 }).catch(e => {}));
  }
});

//<SETUP>
client.on("message", async message => {
  if (message.author.bot || !message.guild || message.webhookID) return;
  xp(message);
  let Prefix = await db.get(`Prefix_${message.guild.id}`);
  if (!Prefix) Prefix = Default_Prefix;
  const escapeRegex = str =>
    str.replace(/[.<>`•√π÷×¶∆£¢€¥*@_+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(Prefix)})\\s*`
  );
  if (!prefixRegex.test(message.content)) return;
  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content
    .slice(matchedPrefix.length)
    .trim()
    .split(/ +/);
  let cmd = args.shift().toLowerCase();

  let cmdx = db.get(`cmd_${message.guild.id}`);
  if (cmdx) {
    let cmdy = cmdx.find(x => x.name === cmd);
    if (cmdy) message.channel.send(cmdy.responce);
  }

  let command =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!command) return;

  let status = db.get(`afkstatus_${message.guild.id}_${message.author.id}`);
  let reason;
  if (status === true) {
    db.set(`afkstatus_${message.guild.id}_${message.author.id}`, false);
    db.delete(`afk_${message.guild.id}_${message.author.id}`);
    message.member.setNickname(message.author.username).catch(err => {});
    return message.reply(`**Welcome Back**`);
  }
  if (message.mentions.users.size) {
    let mentions = message.mentions.users;
    mentions = mentions.filter(mention => mention.id !== message.author.id);
    if (mentions.size) {
      let victim = mentions.find(mention =>
        db.get(`afk_${message.guild.id}_${mention.id}`)
      );
      if (victim) {
        status = db.get(`afkstatus_${message.guild.id}_${victim.id}`);
        reason = db.get(`afk_${message.guild.id}_${victim.id}`);
        let time = db.get(`time_${message.guild.id}_${victim.id}`);
        time = Date.now() - time;
        return message.reply(
          `**${victim.username} is currently AFK - ${reason} - ${format(
            time
          )} ago**`
        );
      }
    }
  }

  if (command.enabled === false) {
    const embed = new Discord.MessageEmbed()
      .setDescription(`This command is disabled.`)
      .setColor("RED")
      .setTimestamp();
    message.channel.send(embed);
    return;
  }
  if (command.premium === false) {
    let server = client.guilds.cache.get(Server_ID);
    if (!server.members.cache.find(r => r.id === message.author.id)) {
      const embed = new Discord.MessageEmbed()
        .setDescription(
          `This command is Premium\nPlease Join [Server](https://dsc.gg/mincoder) To Get Premium Command`
        )
        .setColor("GOLD")
        .setTimestamp();
      message.channel.send(embed);
      return;
    }
  }
  //<COMMAND USAGE AND DESCRIPTION>
  if (command.args && !args.length) {
    return message.channel.send(
      new MessageEmbed()
        .setColor("RED")
        .setTimestamp()
        .setDescription(
          `You didn't provide any arguments, ${
            message.author
          }!\nThe proper usage would be: \n\`\`\`html\n${command.usage ||
            "No Usage"}\n\`\`\`Description:\`\`\`html\n${command.description ||
            "No Description"}\n\`\`\``
        )
    );
  }
  //-------------------------------------------- P E R M I S S I O N -------------------------------------------

  if (command.botPermission) {
    let neededPerms = [];

    command.botPermission.forEach(p => {
      if (!message.guild.me.hasPermission(p)) neededPerms.push("`" + p + "`");
    });

    if (neededPerms.length)
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setTimestamp()
          .setDescription(
            `I need ${neededPerms.join(
              ", "
            )} permission(s) to execute the command!`
          )
      );
  }

  if (command.authorPermission) {
    let neededPerms = [];

    command.authorPermission.forEach(p => {
      if (!message.member.hasPermission(p)) neededPerms.push("`" + p + "`");
    });
    if (neededPerms.length)
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setTimestamp()
          .setDescription(
            `You do not have permission to use this command.\nThis command requires ${neededPerms.join(
              ", "
            )}`
          )
      );
  }
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setTimestamp()
          .setDescription(
            `${client.emotes.error} Please wait **${ms(
              timeLeft
            )}** before reusing the command again.`
          )
      );
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  try {
    if (command) {
      command.run(client, message, args);
    }
  } catch (error) {
    const errrr = new MessageEmbed()
      .setColor("RED")
      .setTimestamp()
      .setDescription(
        `Something went wrong executing that command\nError Message: \`${
          error.message ? error.message : error
        }\``
      );
    return message.channel
      .send(errrr)
      .then(m => m.delete({ timeout: 13000 }).catch(e => {}));

    client.error(error);
  }
});
function xp(message) {
  if (message.author.bot || !message.guild || message.webhookID) return;
  const randomnumber = Math.floor(Math.random() * 10) + 15;
  db.add(`guild_${message.guild.id}_xp_${message.author.id}`, randomnumber);
  db.get(`guild_${message.guild.id}_xptotal_${message.guild.id}`, randomnumber);
  var level =
    db.get(`guild_${message.guild.id}_level_${message.author.id}`) || 1;
  var xp = db.get(`guild_${message.guild.id}_xp_${message.author.id}`);
  var xpNeeded = level * 100;
  if (xpNeeded < xp) {
    var newLevel = db.add(
      `guild_${message.guild.id}_level_${message.author.id}`,
      1
    );

    db.subtract(`guild_${message.guild.id}_xp_${message.author.id}`, xpNeeded);
    if (message.guild.id === message.guild.id) {
      let channel_id = db.get(`levelch_${message.guild.id}`);
      let user = message.author;
      if (channel_id === null) return;
      let levelchannel = client.channels.cache.get(channel_id);
      let image = db.get(`levelimg_${message.guild.id}`);
      var rank = db.get(`guild_${message.guild.id}_xptotal_${user.id}`);
      let color = message.member.displayHexColor;

      if (color == "#000000") color = message.member.hoistRole.hexColor;
      const rak = new canvacord.Rank();

      const ran = new canvacord.Rank()
        .setAvatar(user.displayAvatarURL({ dynamic: false, format: "png" }))
        .setCurrentXP(randomnumber)
        .setRequiredXP(xpNeeded)
        .setLevel(newLevel)
        .setRank(0, "a", false)
        .setStatus(user.presence.status, true, 5)
        .setProgressBar("#00FFFF", "COLOR")
        .setUsername(user.username, color)
        .setDiscriminator(user.discriminator)
        .setBackground(
          "IMAGE",
          image ||
            "https://cdn.discordapp.com/attachments/816254133353840660/819965380406673475/IMG-20201117-WA0142.jpg"
        );
      ran.build().then(data => {
        const attachment = new Discord.MessageAttachment(data, "Rankcard.png");
        const EmbedLevel = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(user.username, message.guild.iconURL())
          .setTimestamp()
          .setDescription(
            `**LEVEL UP** - ${newLevel}
**XP UP** - ${randomnumber}/${xpNeeded}`
          )
          .setImage("attachment://Rankcard.png")
          .attachFiles(attachment);

        levelchannel.send(EmbedLevel);
      });
    } else {
      message.channel.send(
        `${message.author}, You Have Leveled Up To Level **${newLevel}**`
      );
    }
  }
}
//<Chat Bot>
client.on("message", async message => {
  if (message.author.bot || !message.guild || message.webhookID) return;
  const cchann = client.db.get(`chatbot_${message.guild.id}`);
  if (cchann === null) return;
  if (!cchann) return;
  const sender = client.channels.cache.get(cchann);
  if (message.channel.name == sender.name) {
    if (message.author.bot) return;
    message.content = message.content
      .replace(/@(everyone)/gi, "everyone")
      .replace(/@(here)/gi, "here");
    message.channel.stopTyping();
    message.channel.startTyping();
    fetch(
      `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(
        message.content
      )}&botname=${client.user.username}&ownername=lmon`
    )
      .then(res => res.json())
      .then(data => {
        message.inlineReply(data.message);
      });
    message.channel.stopTyping();
  }
});

client.on("message", async message => {
  if (message.author.bot || !message.guild || message.webhookID) return;
  let Prefix = await db.get(`Prefix_${message.guild.id}`);
  if (!Prefix) Prefix = Default_Prefix;
  if (message.content.startsWith(Prefix + "react")) return;
  let msg = message.content;
  let emojis = msg.match(/(?<=:)([^:\s]+)(?=:)/g);
  if (!emojis) return;
  emojis.forEach(m => {
    let emoji = message.guild.emojis.cache.find(x => x.name === m);
    if (!emoji) return;
    let temp = emoji.toString();
    if (new RegExp(temp, "g").test(msg))
      msg = msg.replace(new RegExp(temp, "g"), emoji.toString());
    else msg = msg.replace(new RegExp(":" + m + ":", "g"), emoji.toString());
  });

  if (msg === message.content) return;

  let webhook = await message.channel.fetchWebhooks();
  let number = randomNumber(1, 2);
  webhook = webhook.find(x => x.name === "NQN" + number);

  if (!webhook) {
    webhook = await message.channel.createWebhook(`NQN` + number, {
      avatar: client.user.displayAvatarURL({ dynamic: true })
    });
  }

  await webhook.edit({
    name: message.member.nickname
      ? message.member.nickname
      : message.author.username,
    avatar: message.author.displayAvatarURL({ dynamic: true })
  });

  message.delete().catch(err => {});
  webhook.send(msg).catch(err => {});

  await webhook.edit({
    name: `NQN` + number,
    avatar: client.user.displayAvatarURL({ dynamic: true })
  });
});
//--------------------------------------------------- F U N C T I O N S --------------------------------------
function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomString(length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var s = "";
  for (var i = 0; i < length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    s += chars.substring(rnum, rnum + 1);
  }

  return s;
}
function resolveUser(search) {
  if (!search || typeof search !== "string") return null;
  let user = null;
  if (search.match(/^<@!?(\d+)>$/))
    user = this.users.fetch(search.match(/^<@!?(\d+)>$/)[1]).catch(() => {});
  if (search.match(/^!?(\w+)#(\d+)$/) && !user)
    user = this.users.cache.find(
      u =>
        u.username === search.match(/^!?(\w+)#(\d+)$/)[0] &&
        u.discriminator === search.match(/^!?(\w+)#(\d+)$/)[1]
    );
  if (search.match(/.{2,32}/) && !user)
    user = this.users.cache.find(u => u.username === search);
  if (!user) user = this.users.fetch(search).catch(() => {});
  return user;
}

client
  .login(Token)
  .catch(() =>
    console.log(`❌ Invalid Token Is Provided - Please Give Valid Token!`)
  );
// Load settings file.
