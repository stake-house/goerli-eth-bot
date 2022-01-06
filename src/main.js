require('dotenv').config();

const Discord = require('discord.js');
const goerliBot = require('./goerliBot.js');
require('discord-reply');
const bot = new Discord.Client();
const web3 = require('web3');

const COMMAND_PREFIX = '+goerlieth';
const EMBEDDED_HELP_MESSAGE = {
  embed: {
    color: 3447003,
    title: "Goerli ETH Bot",
    description: "Welcome to the Goerli ETH Faucet.  See below for my commands.",
    fields: [{
        name: "+goerlieth <address>",
        value: '`Sends 1 goerli eth to the address specified. \n\nEx: +goerliEth 0x56d389C4E07A48d429035532402301310B8143A0*`'
      },
      {
        name: "+goerlieth help",
        value: "`Shows this message.`"
      },
      {
        name: "+goerlieth mod",
        value: "`Tags the maintainers of this bot, please use if you are experiencing any issues.`"
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
    
    if (args[1].includes('0x')){
      if (web3.utils.isAddress(args[1]){
        bot.commands.get('goerliBot').execute(message, args, true);
      }else{
        embed.setDescription('**Error:**Address is not in the proper format. Please double check.');
        message.lineReply(embed);
      }
  }
    
    switch(args[1]){ 
      // Faucet commands
      case 'null': {
        embed.setDescription('**Error:**Use `+goerlieth help` for the list of commands!')
        message.lineReply(embed);
      }

      // Other commands
      case 'help': {
        console.log("help called");
//         message.channel.send(EMBEDDED_HELP_MESSAGE);
        message.lineReply(EMBEDDED_HELP_MESSAGE);
        break;
      }
      
      case 'mod': {
        // Tag the moderators
        console.log("mod called");
        // Uncomment below and add discord ids if you'd like to be tagged
        
        let embed = new Discord.MessageEmbed()
            .setDescription('**Alerting the Administrators**\n @!<723840404159594496> come check this out!')
            .setColor(3447003).setTimestamp();
        message.lineReply(embed);
        break;
      }

      // For fun :)
      case 'dance': {
        console.log("dance called");
        let embed = new Discord.MessageEmbed().setImage('https://c.tenor.com/fJh-W38iA3oAAAAM/dance-kid.gif').setColor(3447003).setTimestamp();
        message.lineReply(embed);
        break;
      }
    }
  } catch (e) {
    console.log(e);
    let embed = new Discord.MessageEmbed().setDescription('Something went wrong. If this continues, please contact the mods of this bot by using command: `!mod`').setColor(0xff1100).setTimestamp();
    message.lineReply(embed);
  }
});
