require('dotenv').config({path: '../.env'})

const utils = require('./utils.js');
const Discord = require('discord.js');
const etherscan = require('./api.js');
const db = require('./db.js');
const Web3 = require('web3');
const { max } = require('pg/lib/defaults');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_HTTPS_ENDPOINT));

const DEFAULT_GAS_PRICE = 1500000000000; // 1,500 gwei

const INELIGIBLE_NO_CUSTOM_CHECKS_MESSAGE = " is ineligible to receive goerli eth.";
const INELIGIBLE_CUSTOM_CHECKS_MESSAGE = " is ineligible to receive goerli eth.  You must pass the custom checks;";

const maxDepositAmount = Number(process.env.MAX_DEPOSIT_AMOUNT) 

const runCustomEligibilityChecks = async (discordID, address, topUpAmount) => {
  const res = await db.confirmTransaction(discordID, address, topUpAmount/Math.pow(10,18));
  return res
  //return false

}

const receiverIsEligible = async (discordID, address, amountRequested, runCustomChecks)  => {
  //const needsGoerliEth = true;
  if (runCustomChecks === true) {
    const passedCustomChecks = await runCustomEligibilityChecks(discordID, address, amountRequested);
    return passedCustomChecks;
  } else {
    return true;
  }
}

const runGoerliFaucet = async (message, address, runCustomChecks) => {
  const currentBalance = await etherscan.getBalance(address);
  if (currentBalance === null) {
    console.log("Something went wrong while connecting to API to recieve balance.");

    if (message) {
      let embed = new Discord.MessageEmbed().setDescription("**Error:** Something went wrong while getting address details please try again.").
      setTimestamp().setColor(0xff1100);
      message.lineReply(embed)
    }
    return;
  };

  const topUpAmount = maxDepositAmount - (currentBalance);

  if(topUpAmount <= 0 ) {
    console.log("Address has max deposit amount.");

    if (message) {
      let embed = new Discord.MessageEmbed().setDescription("**Operation Unsuccessful**\nAddress has max deposit amount.").
      setTimestamp().setColor(0xff1100);
      message.lineReply(embed);
    }
    return;
  };

  console.log("address " + address + " is requesting " + topUpAmount/Math.pow(10,18) + " goerli eth.  Custom checks: " + runCustomChecks);

  // Make sure the bot has enough Goerli ETH to send
  const faucetReady = await utils.faucetIsReady(process.env.FAUCET_ADDRESS, (topUpAmount + 1500000000000)/Math.pow(10,18));
  if (!faucetReady) {
    console.log("Faucet does not have enough ETH.");

    if (message) {
      let embed = new Discord.MessageEmbed().setDescription("**Operation Unsuccessful**\nThe Bot does not have enough Goerli ETH.  Please contact the maintainers.").
      setTimestamp().setColor(0xff1100);
      message.lineReply(embed);
    }
    return;
  }

  const receiverEligible = await receiverIsEligible(message.author.id, address, topUpAmount, runCustomChecks);
  if (receiverIsEligible === null){
    const m1 = '**Error:** Something went wrong while confirming your transaction please try again.'
    if (message) {
      let embed = new Discord.MessageEmbed().setDescription(m1).
      setTimestamp().setColor(3447003);
      message.lineReply(embed);
    }

  }

  if (typeof receiverEligible === String){
    const m1 = receiverEligible
    if (message) {
      let embed = new Discord.MessageEmbed().setDescription(m1).
      setTimestamp().setColor(3447003);
      message.lineReply(embed);
    }
  }

  if (!receiverEligible) {
    const m = runCustomChecks ? address + INELIGIBLE_CUSTOM_CHECKS_MESSAGE
      : address + INELIGIBLE_NO_CUSTOM_CHECKS_MESSAGE;

    console.log(m);

    if (message) {
      let embed = new Discord.MessageEmbed().setDescription(m).
      setTimestamp().setColor(3447003);
      message.lineReply(embed);
    }
    return;
  }

  console.log("Checks passed - sending to " +  address);
  if (message) {
    let embed = new Discord.MessageEmbed().setDescription("**Operation Successful**\nChecks passed - sending...").
    setTimestamp().setColor(3447003);
    message.lineReply(embed);
  }

  const nonce = utils.getCachedNonce();
  utils.sendGoerliEth(message, process.env.FAUCET_ADDRESS, process.env.FAUCET_PRIVATE_KEY, address, topUpAmount/Math.pow(10,18), nonce, DEFAULT_GAS_PRICE);
  
  utils.incrementCachedNonce();
}

// This runs once when imported (bot starting) to cache the nonce in a local file
utils.initializeCachedNonce();

module.exports = {
  name: 'goerliBot',
  description: 'Sends goerli eth to the user.',
  execute(message, args, runCustomChecks = true) {
    runGoerliFaucet(message, args[1], runCustomChecks);
  }
} 

utils.initializeCachedNonce();

//runGoerliFaucet(null, "0x066Adead2d82A1C2700b4B48ee82ec952b6b18dA", true);
