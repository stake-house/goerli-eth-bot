const axios = require('axios');
const rateLimit = require('axios-rate-limit');
require('dotenv').config({path: '../.env'})
const { ETHERSCAN_API_KEY, ETHERSCAN_API_URL, FAUCET_ADDRESS, GOERLI_API_URL } = process.env;

const getBlockNumber = async function(time) {
    const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 1000, maxRPS: 1})
    const url = `${GOERLI_API_URL}?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${ETHERSCAN_API_KEY}`
    return (await (request.get(url))).data.result;
   
}
const getTransactions = async function (address, fromBlock) {
    const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 1000, maxRPS: 1})
    const url = `${GOERLI_API_URL}?module=account&action=txlist&address=${address}&startblock=${fromBlock}&endblock=latest&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    const res = await request.get(url)
    return res.data.result;
}

const getBalance = async function (address){
    const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 1000, maxRPS: 1});
    const url = `${GOERLI_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
    return (await request.get(url)).data.result;
}

module.exports = {
    checkDeposit: async function(address) {
        var paidFlag = false;
        var time = new Date();
        time.setDate(time.getDate() - 2);


        const fromBlock = await getBlockNumber(Math.floor(time.getTime()/1000))
        var depositedTxArray = []
        //const sendAddress = "0x49a00b366cf5de47304a9a28bfb2956e29de3228"
        const tx = await getTransactions(address, fromBlock);
        if (tx) {
            for (count = 0; count < tx.length; count++){
                //faucet address shoudld be = 0x00000000219ab540356cBB839Cbe05303d7705Fa
                // if (tx[count].to === FAUCET_ADDRESS && tx[count].value === '32000000000000000000') {
                //     depositedTxArray.push(tx[count].hash);
                // }
                if (tx[count].to === FAUCET_ADDRESS.toLowerCase()) {
                    depositedTxArray.push({hash: tx[count].hash, amount: tx[count].value});
                }
            }
        }
        return depositedTxArray;

    },
    getBalance: async function (address){
        const request = await rateLimit(axios.create(), {maxRequests: 5, perMillisecondss: 1000, maxRPS: 1});
        const url = `${ GOERLI_API_URL }?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        return (await request.get(url)).data.result;
    }
}

/*
const init = async function(){

    var time = new Date();
    time.setDate(time.getDate() - 2);
    //console.log(time.toDateString())


    const fromBlock = await getBlockNumber(Math.floor(time.getTime()/1000))
    
    //const logs  = await getLogs( "0x00000000219ab540356cBB839Cbe05303d7705Fa", fromBlock);
    // console.log(logs)
    const sendAddress = "0x49a00b366cf5de47304a9a28bfb2956e29de3228"
    const tx = await getTransactions(sendAddress, fromBlock);
    var depositedTxArray = []
    console.log(tx);
    var paidFlag = false;
    for (count = 0; count < tx.length; count++){
        //console.log(tx[count].to, tx[count].value);
        if (tx[count].to === "0x00000000219ab540356cbb839cbe05303d7705fa" && tx[count].value === '32000000000000000000') {
            depositedTxArray.push(tx[count].hash);
        }
    }
    console.log(depositedTxArray);
}
init();*/