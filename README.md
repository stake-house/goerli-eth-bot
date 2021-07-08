# Goerli ETH Bot

## Configuration

### Discord Setup

*butta to help fill out*

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
