# Goerli ETH Bot
![Current Version](https://img.shields.io/badge/version-v1.0-blue)
![GitHub contributors](https://img.shields.io/github/contributors/hamzi15/SSV-goerli-eth-bot)
![GitHub stars](https://img.shields.io/github/stars/hamzi15/SSV-goerli-eth-bot?style=social)
![GitHub forks](https://img.shields.io/github/forks/hamzi15/SSV-goerli-eth-bot?style=social)
![Twitter](https://img.shields.io/twitter/follow/abdullahbaig_0?style=social)

A discord bot which distributes GoErli Test Token to the members of a server and keeps track of the amount distributed.

## Table of Contents
- [Configuration](#configuration)
  - [Create Bot Application ](#create-bot-application)
  - [Adding the Bot to your server](#adding-the-bot-to-your-server)
- [Running the bot backend](#running-the-bot-backend)
- [Testing](#testing)
- [SSV.network Custom Checks](#ssv-network-custom-checks)
  - [Code](#code)
    - [.env](#env)
    - [api.js](#api)
    - [db.js](#dbjs)
    - [goErliBot.js](#goErliBot)
    - [utils.js](#utils)
    - [main.js](#main)
- [Acknowledgments](#acknowledgments)
<!-- 	- [Tools Required](#tools-required) -->
<!-- 	- [Installation](#installation) -->
<!-- - [Deployment](#deployment) -->
<!-- - [Authors](#authors) -->
<!-- - [License](#license) -->


## Configuration

### Create Bot Application 

1) Head over to https://discord.com/developers/applications/

2) Create a new application

![image](https://user-images.githubusercontent.com/26490734/125040553-16606900-e098-11eb-9f82-c5463fad4292.png)

3) Give your Bot a name

![image](https://user-images.githubusercontent.com/26490734/125041062-9edf0980-e098-11eb-9fc0-af391f06d48c.png)

3) Get your bot's token and add it to your .env file (details below)

![mspaint_2021-07-09_09-35-59](https://user-images.githubusercontent.com/26490734/125041473-16ad3400-e099-11eb-81cc-34c7c4dc9261.png)

### Adding the Bot to your server
1) Add the bot to your server 

![mspaint_2021-07-09_09-39-43](https://user-images.githubusercontent.com/26490734/125041956-9fc46b00-e099-11eb-8732-96442545b3bb.png)

2) Authorize the bot and it will appear in your server!

![image](https://i.imgur.com/uVGsGJP.jpeg)

Note: The bot will stay offline until you run the bot's backend

## Running the Bot Backend

1) Clone this repo

2) `cp .env.example .env` and fill out the required variables, including the bot token from above

3) Implement any custom checks you want your bot to run in the `receiverIsEligible` function in `src/goerliBot.js`
* If you implement custom checks, make sure to pass in `true` when calling `bot.commands.get('goerliBot').execute(message, args, 1, true);`
* The bot is currently configured to send 33 goerli eth, and if the address already has 33 goerli eth it will not send

4) Add discord user id's to the maintainers command if you would like to

5) Run the bot with the following commands
  * `npm install`
  * `node main.js`

## Testing
* Take a look at the "Test Zone" at the bottom of `src/goerliBot.js` and write the appropriate function calls for the tests you want to run
    * you can bypass the actual bot here and test the underlying functions
* `npm install`
* `node src/goerliBot.js`

## SSV Network Custom Checks
### Code
All values, constants and variables related to ETH, are standardized to 10^18.
#### env
* `FAUCET_ADDRESS`: You have to provide the faucet address here; the address of the wallet holding the goerli eth you will distribute
* `FAUCET_PRIVATE_KEY`:  You have to provide the faucet private key here; the private key of the wallet holding the goerli eth you will distribute
* `DISCORD_BOT_TOKEN`: Bot token generated [here](#create-bot-application).
* `INFURA_HTTPS_ENDPOINT`: https://goerli.infura.io/v3/1cc5a78e2e72446880dee3ff4b82cae1. Infura HTTPS endpoint from settings on infura.io
* `NONCE_FILE`: Full path to nonce file location (file does not need to exist, but folder does), i.e. `/Users/hamzaasaad/Documents/GitHub/goerli-eth-bot/nonceFolder/noncefile.txt`
* `ETHERSCAN_API_KEY`
* `ETHERSCAN_API_URL`: https://api.etherscan.io/api
* `DB_USERNAME`: Database username
* `DB_HOST`: Database host
* `DB_PASS`: Database password
* `DB_PORT`: Database port

#### api
`api.js` util file for dealing with the Etherscan API to fetch latest block and transactions data.
* `getBlockNumber(time)` helper function uses the Etherescan API to get a specific block by time. This is a helper function for it. Please refer to this [link](https://docs.bscscan.com/api-endpoints/blocks#get-block-number-by-timestamp) to read more about `get-block-number-by-timestamp` get request
* `getTransactions(address, fromBlock)` helper function uses the Etherscan API to get an address's transactions array. `fromBlock` parameter is the starting block. This function will return all the transactions from starting block till now.
* `getBalance(address)` helper function returns the current balance of an address
* `checkDeposit(address)` function returns an array containing all the transactions related to `FAUCET_ADDRESS` in the last 48 hours. The array contains objects which have the structure: `{hash: transactionHash, amount: amountSentToFaucet}`

#### db
`db.js` util file for updating and confirming transactions.
* `depositAmount`: Total ETH user should send to the `FAUCET_ADDRESS`. In our case, `32000000000000000000`.
* `dailyLimit`: The max daily amount an address can have
* `weeklyLimit`: The max weekly amount an address can have
* `confirmTransaction(addressDetails, topUpAmount)`: It is the main function where all helper functions come together to validate the transactions of a certain address. It deals with several edge cases. `addressDetails` param is stored and fetched from the database via `checkAddressExists(address)`.
* `validateTransaction(addressDetails, topUpAmount)`: Helper function used by `confirmTransaction` to validate whether or not an address has sent a new transaction of the required amount of ETH to the faucet address. Returns `true` if such a transaction exists otherwise `false`. The transactions of a certain address over the last 48 hours, are fetched via `checkDeposit(address)` helper function. 

#### goErliBot
`goErliBot.js` file where all the exports in `db.js`, `api.js`, and `utils.js`, come together and then exported to `main.js` file in a single function `runGoerliFaucet(message, address, amount, runCustomChecks)`.
* `maxDepositAmount`: You have to set its value. It's the max amount `FAUCET_ADDRESS` can send (`32000000000000000000` in our case)
* `runCustomEligibilityChecks(address)`:  `topUpAmount` is calculated like so: `maxDepositAmount - currentBalance`, where `maxDepositAmount` is the limit set by us which is `32000000000000000000` in our case and `currentBalance` is the current GoErli GoETH balance of an address.
* `runGoerliFaucet(message, address, amount, runCustomChecks)`: Contains several checks to ensure that the address provided by a user is eligible and valid. `message` param is the original message sent by the user on Discord. `address` is the address provided by the user. `amount` is the amount requested by the user. `runCustomChecks` bool value to decide if custom checks are to be run or not.

#### utils
`utils.js` util file containing the necessary methods to conduct GoErli ETH transactions.

#### main
`main.js` file which deals with Discord API via `discord.js` module. Recieves the command of a discord member, processes their request and dispatches the appropriate message in response.

## Acknowledgements
This bot is forked from [Stake-house/GoErli-Eth-Bot](https://github.com/stake-house/goerli-eth-bot)
