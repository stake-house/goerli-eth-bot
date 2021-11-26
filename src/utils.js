require('dotenv').config();

const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_HTTPS_ENDPOINT));

// Eth
exports.getAddressTransactionCount = async (address) => {
  const nonce = await web3.eth.getTransactionCount(address);
  return nonce;
}

exports.getAddressBalance = async (address) => {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei);
}


// Math
exports.incrementHexNumber = (hex) => {
  var intNonce = parseInt(hex, 16);
  var intIncrementedNonce = parseInt(intNonce+1, 10);
  var hexIncrementedNonce = '0x'+ intIncrementedNonce.toString(16);

  return hexIncrementedNonce;
}


// Nonce caching
exports.getCachedNonce = () => {
  return fs.readFileSync(process.env.NONCE_FILE, 'utf8');
}

exports.incrementCachedNonce = async () => {
  const currentNonce = this.getCachedNonce();
  const incrementedNonce = this.incrementHexNumber(currentNonce);

  this.setCachedNonce(incrementedNonce);
}

exports.initializeCachedNonce = async () => {
  const intNextNonceToUse = await this.getAddressTransactionCount(process.env.FAUCET_ADDRESS);
  const hexNextNonceToUse = '0x'+ intNextNonceToUse.toString(16);

  this.setCachedNonce(hexNextNonceToUse);
}

exports.setCachedNonce = (nonce) => {
  fs.writeFile(process.env.NONCE_FILE, nonce, function (err){ 
    if (err) throw err;
  })
}


// Sending the goerli ETH
exports.sendGoerliEth = (message, faucetAddress, faucetKey, receiverAddress, amount, nonce, gasPrice) => {
  console.log("In sendGoerliETH", faucetAddress, faucetKey, receiverAddress);
  var rawTransaction = {
    "from": faucetAddress, 
    "to": receiverAddress,
    "value": web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
    "gas": 21000,
    "gasPrice": gasPrice,
    "chainId": 97, //goerli chain ID
    "nonce": nonce,
  };

  web3.eth.accounts.signTransaction(rawTransaction, faucetKey)
    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    .then(receipt => {
      console.log("Sent to " + receiverAddress + " transaction receipt: ", receipt)

      if (message) {
        message.channel.send("Sent " + amount + " goerli ETH to " + receiverAddress + " - please wait a few mins for it to arrive.  Transaction: https://goerli.etherscan.io/tx/" + receipt.transactionHash);
      }
    })
    .catch(err => {
      console.error("this is the error: " + err);
      throw err;
    });
}


// Validate faucet
exports.faucetIsReady = async (faucetAddress, amountRequested) => {
  const faucetBalance = await this.getAddressBalance(faucetAddress);
  console.log("Faucet Balance:",faucetBalance);
  const faucetBalanceNumber = Number(faucetBalance);
  const amountRequestedNumber = Number(amountRequested);

  return faucetBalanceNumber > amountRequestedNumber;
}
