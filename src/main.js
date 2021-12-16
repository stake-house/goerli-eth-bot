require('dotenv').config();

const Discord = require('discord.js');
const goerliBot = require('./goerliBot.js');
const bot = new Discord.Client();
const web3 = require('web3');

const COMMAND_PREFIX = '!';
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

var yourBotToken = process.env.DISCORD_BOT_TOKEN;
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
        if (args[1] == null) {
          message.channel.send('Goerli ETH adress required.')
          break;
        } else if (!web3.utils.isAddress(args[1])) {
          message.channel.send('Address is not the proper format.  Please double check.')
          break;
        } else {
          // 3rd arg is amount of eth, 4th is whether to run custom checks
          bot.commands.get('goerliBot').execute(message, args, 0.001, true);
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
        // message.channel.send('Alerting the maintainers - <@discord-id> and <@discord-id> come check this out.');
        break;
      }

      // For fun :)
      case 'dance': {
        console.log("dance called");
        message.channel.send('https://c.tenor.com/fJh-W38iA3oAAAAM/dance-kid.gif');
        break;
      }
    }
  } catch (e) {
    console.log(e);
    message.channel.send('Something went wrong.  If this continues, contact the mods of this bot by messaging me: !mod');
  }
});
