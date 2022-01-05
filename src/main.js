require('dotenv').config();

const Discord = require('discord.js');
const goerliBot = require('./goerliBot.js');
require('discord-reply');
const bot = new Discord.Client();
const web3 = require('web3');

const COMMAND_PREFIX = '+';
const EMBEDDED_HELP_MESSAGE = {
  embed: {
    color: 3447003,
    title: "Goerli ETH Bot",
    description: "Welcome to the Goerli ETH Faucet.  See below for my commands.",
    fields: [{
        name: "!goerliEth <address>",
        value: `
        Sends 1 goerli eth to the address specified.
        Ex: !goerliEth 0x56d389C4E07A48d429035532402301310B8143A0
        `
      },
      {
        name: "!help",
        value: "Shows this message."
      },
      {
        name: "!mod",
        value: "Tags the maintainers of this bot, please use if you are experiencing any issues."
      }
    ]
  }
}

let yourBotToken = process.env.DISCORD_BOT_TOKEN;
bot.login(yourBotToken);

bot.commands = new Discord.Collection();
bot.commands.set(goerliBot.name, goerliBot);

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.on('message', (message) => {
  try {
    if (!message || message.length == 0 || message.content.substring(0, COMMAND_PREFIX.length) != COMMAND_PREFIX) {
      return;
    }

    const args = message.content.substring(COMMAND_PREFIX.length).split(" ")

    switch(args[0]){ 
      // Faucet commands
      case 'goerliEth': {
        console.log('goerliETH called');
        let embed = new Discord.MessageEmbed().setColor(3447003).setTimestamp();
        if (args[1] == null) {
          embed.setDescription('Goerli ETH address is required.');
          message.channel.send({embed});
          break;
        } else if (!web3.utils.isAddress(args[1])) {
          embed.setDescription('Address is not in the proper format. Please double check.');
          message.channel.send({embed});
          break;
        } else {
          // 3rd arg is amount of eth, 4th is whether to run custom checks
          bot.commands.get('goerliBot').execute(message, args, true);
        }
        break;
      }

      // Other commands
      case 'help': {
        console.log("help called");
        message.channel.send(EMBEDDED_HELP_MESSAGE);
        break;
      }
      
      case 'mod': {
        // Tag the moderators
        console.log("mod called");
        // Uncomment below and add discord ids if you'd like to be tagged
        
        // let embed = new Discord.MessageEmbed()
        //     .setDescription('Alerting the maintainers - @!<discord-id> and @!<@discord-id> come check this out.')
        //     .setColor(3447003).setTimestamp();
        // message.channel.send({embed});
        break;
      }

      // For fun :)
      case 'dance': {
        console.log("dance called");
        let embed = new Discord.MessageEmbed().setImage('https://c.tenor.com/fJh-W38iA3oAAAAM/dance-kid.gif').setColor(3447003).setTimestamp();
        message.channel.send({embed});
        break;
      }
    }
  } catch (e) {
    console.log(e);
    let embed = new Discord.MessageEmbed().setDescription('Something went wrong. If this continues, please contact the mods of this bot by using command: `!mod`').setColor(0xff1100).setTimestamp();
    message.channel.send({embed});
  }
});
