const Discord = require("discord.js");
module.exports = {
  name: "addword",
  authorPermission: ["VIEW_CHANNEL", "MANAGE_GUILD"],
  botPermission: ["VIEW_CHANNEL", "MANAGE_GUILD"],
  category: "anti-swear",
  run: async (client, message, args) => {
    let pog = client.db.get(`words_${message.guild.id}`);
    let word = args[0];
    if (!word) {
      let embed = new Discord.MessageEmbed()
        .setTitle("Error")
        .setDescription(`:x: | **No word provided**\nFormat: \`+addword fk\``)
        .setFooter(
          message.author.tag + " | cwkhan ",
          message.author.displayAvatarURL()
        )
        .setThumbnail(message.guild.iconURL())
        .setColor("#FF0000");
      return message.channel.send({
        embed: embed
      });
    }
    if (pog && pog.find(find => find.word == word)) {
      let embed = new Discord.MessageEmbed();
      embed.setAuthor(message.guild.name, message.guild.iconURL());
      embed.setTitle("Error");
      embed.setDescription(`:x: | **The word is already on the database**`);
      embed.setFooter(
        message.author.tag + " | made by cwkhan",
        message.author.displayAvatarURL({ dynamic: true })
      );
      embed.setTimestamp();
      embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      return message.channel.send({
        embed: embed
      });
    }
    let yes = {
      word: word,
      author: message.author.tag
    };
    client.db.push(`words_${message.guild.id}`, yes);
    let embed = new Discord.MessageEmbed();
    embed.setAuthor(message.guild.name, message.guild.iconURL());
    embed.setTitle("Success");
    embed.setThumbnail(message.guild.iconURL());
    embed.setDescription(`**The word has been added!**`);
    embed.setFooter(
      message.author.tag + " | made by cwkhan",
      message.author.displayAvatarURL({ dynamic: true })
    );
    embed.setColor("RANDOM");
    embed.setTimestamp();
    message.channel.send({
      embed: embed
    });
  }
};
