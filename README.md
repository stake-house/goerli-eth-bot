# Goerli ETH Bot
![Current Version](https://img.shields.io/badge/version-v1.0-blue)
![GitHub contributors](https://img.shields.io/github/contributors/hamzi15/SSV-goerli-eth-bot)
![GitHub stars](https://img.shields.io/github/stars/hamzi15/SSV-goerli-eth-bot?style=social)
![GitHub forks](https://img.shields.io/github/forks/hamzi15/SSV-goerli-eth-bot?style=social)
![Twitter](https://img.shields.io/twitter/follow/abdullahbaig_0?style=social)
![Linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)
[![Linkedin](https://i.stack.imgur.com/gVE0j.png) LinkedIn](https://www.linkedin.com/in/abdullah-baig-08983321a)

## Configuration

### Discord Setup

#### Create bot application 

1) Head over to https://discord.com/developers/applications/

2) Create a new application

![image](https://user-images.githubusercontent.com/26490734/125040553-16606900-e098-11eb-9f82-c5463fad4292.png)

3) Give your Bot a name

![image](https://user-images.githubusercontent.com/26490734/125041062-9edf0980-e098-11eb-9fc0-af391f06d48c.png)

3) Get your bot's token and add it to your .env file (details below)

![mspaint_2021-07-09_09-35-59](https://user-images.githubusercontent.com/26490734/125041473-16ad3400-e099-11eb-81cc-34c7c4dc9261.png)

4) Add bot to your server 

![mspaint_2021-07-09_09-39-43](https://user-images.githubusercontent.com/26490734/125041956-9fc46b00-e099-11eb-8732-96442545b3bb.png)

5) Authorize the bot and it will appear in your server!

_[image source](https://www.writebots.com/discord-bot-token/)_

#### Run the bot backend

1) Clone this repo

2) `cp .env.example .env` and fill out the required variables, including the token from above

3) Implement any custom checks you want your bot to run in the `receiverIsEligible` function in `src/goerliBot.js`
* If you implement custom checks, make sure to pass in `true` when calling `bot.commands.get('goerliBot').execute(message, args, 1, true);`
* The bot is currently configured to send 1 goerli eth, and if the address already has 1 it will not send

4) Add discord user id's to the maintainers command if you would like to

5) Run the bot with the following commands
* `yarn install`
* `yarn start > logfile.txt`

## Testing
* `yarn install`
* take a look at the "Test Zone" at the bottom of `src/goerliBot.js` and write the appropriate function calls for the tests you want to run
    * you can bypass the actual bot here and test the underlying functions
* `node src/goerliBot.js`

## Contributions

This started off as the EthStaker goerli bot, and we wanted to make it available for anyone to use.  Please let us know if you have any issues or suggestions for how to make things clearer.  PRs are always welcome too :)
