const axios = require('axios');
const rateLimit = require('axios-rate-limit');
require('dotenv').config({path: '../.env'})
const { ETHERSCAN_API_KEY, ETHERSCAN_API_URL, FAUCET_ADDRESS, GOERLI_API_URL } = process.env;
const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 500})


const getBlockNumber = async function(time) {
    const url = `${ETHERSCAN_API_URL}?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${ETHERSCAN_API_KEY}`
    return (await (request.get(url))).data.result;
}
const getTransactions = async function (address, fromBlock) {
    const url = `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=${fromBlock}&endblock=latest&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    const res = await request.get(url)
    return res.data.result;
}

module.exports = {
    checkDeposit: async function(address) {
        var count = 0
        while (true) {
            try {
                var time = new Date();
                time.setDate(time.getDate() - 2);
                const fromBlock = await getBlockNumber(Math.floor(time.getTime()/1000))
                var depositedTxArray = []
                const tx = await getTransactions(address, fromBlock);
                if (tx) {
                    for (count = 0; count < tx.length; count++){
                        if (tx[count].to === FAUCET_ADDRESS.toLowerCase()) {
                            depositedTxArray.push({hash: tx[count].hash, amount: tx[count].value});
                        }
                    }
                }
                return depositedTxArray;
            } catch (e) {
                if (++count == maxTries) return null;
            }
        }

    },
    getBalance: async function (address){
        var count = 0;
        while (true){
            try {
                //const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 1000, maxRPS: 1});
                const url = `${ GOERLI_API_URL }?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
                return (await request.get(url)).data.result;
            } catch (e) {
                if (++count == maxTries) return null;
            }
        }
    }
    }
}