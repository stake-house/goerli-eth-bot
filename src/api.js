const axios = require('axios');
require('dotenv').config();
const { ETHERSCAN_API_KEY, ETHERSCAN_API_URL, FAUCET_ADDRESS } = process.env;
console.log(ETHERSCAN_API_KEY,ETHERSCAN_API_URL);

const getBlockNumber = async function(time) {
    const url = `${ETHERSCAN_API_URL}?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${ETHERSCAN_API_KEY}`
    console.log(time)
    return (await axios.get(url)).data.result
    // .then(res => {
    //         return res.data.result
    //     }, (error) => {
    //         console.log(error)
    //     }
    // )
    

    // console.log(res)
}

const getLogs = async function(address, fromBlock) {
    const url = `${ETHERSCAN_API_URL}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=latest&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    return (await axios.get(url)).data.result
    
}

const init = async function(){

    var time = new Date();
    time.setDate(time.getDate() - 2);
    console.log(time.toDateString())


    const fromBlock = await getBlockNumber(Math.floor(time.getTime()/1000))
    console.log(fromBlock)
    
    const logs  = await getLogs( "0x00000000219ab540356cBB839Cbe05303d7705Fa", fromBlock);
    // console.log(logs)
    console.log(logs[0]);
}
init();

// console.log(res)

/*modules.export = {
  
}*/