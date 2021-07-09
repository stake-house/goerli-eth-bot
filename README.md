# Goerli ETH Bot

## Configuration

### Discord Setup

#### Create bot application 

1) Head over to https://discord.com/developers/applications/

2) Create a new application

![image](https://user-images.githubusercontent.com/26490734/125040553-16606900-e098-11eb-9f82-c5463fad4292.png)

3) Give your Bot a name

![image](https://user-images.githubusercontent.com/26490734/125041062-9edf0980-e098-11eb-9fc0-af391f06d48c.png)

3) Get your bot's token and add it to the .env.example file

![mspaint_2021-07-09_09-35-59](https://user-images.githubusercontent.com/26490734/125041473-16ad3400-e099-11eb-81cc-34c7c4dc9261.png)

4) Add bot to your server 

![mspaint_2021-07-09_09-39-43](https://user-images.githubusercontent.com/26490734/125041956-9fc46b00-e099-11eb-8732-96442545b3bb.png)

5) Authorize the bot and it will appear in your server!

_[image source](https://www.writebots.com/discord-bot-token/)_

### Bot

#### Setup
* create `.env` file and fill in required variables (see `.env.example`)
* make sure to add your discord bot token from above

##### Custom Checks
* Implement any necessary custom checks in the function `receiverIsEligible` and make sure `runCustomChecks` is true in your initial bot configuration if you want them applied

## Running
* `yarn install`
* `yarn start > logfile.txt`

## Testing
* `yarn install`
* take a look at the "Test Zone" at the bottom of `src/goerliBot.js` and write the appropriate function calls for the tests you want to run
* `node src/goerliBot.js`




# to use
.env file
add maintainer ids to message
implement any custom checks
