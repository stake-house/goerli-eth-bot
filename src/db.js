
//var Depositor = require('../db/index').depositor;
//Depositor.findAll();*
const {API} = require('./api.js');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'hamzaasaad',
    host: 'localhost',
    database: 'hamzaasaad',
    password: null,
    port: 5431,
  })
pool.connect()
const createTable = `create table depositor(
    address VARCHAR,
    norequests INT,
    dailyCount INT,
    weeklyCount INT,
    firstrequesttime TIMESTAMP WITHOUT TIME ZONE,
    dailyTime TIMESTAMP WITHOUT TIME ZONE,
    weeklyTime TIMESTAMP WITHOUT TIME ZONE,
    validatedtx VARCHAR,
    unaccountedtx VARCHAR
)`

//pool.query(createTable);

const init = async function(){
const now = new Date()
const insert = "INSERT INTO depositor (address,norequests,dailyCount,weeklyCount,firstrequesttime,dailyTime,weeklyTime,validatedtx,unaccountedtx) VALUES ('$1',$2,$3,$4,'$5','$6','$7',$8,$9)";
//const insertVals = ['0x123',33,330,now,now]
const text = 'select dailytime from depositor where address= $1';
const values = ['0x123']

const result = await pool.query(text,values);
var time = (result.rows[0]).dailytime;
//console.log(time.UTC());
var dif = Math.floor(now.getTime()/1000) - Math.floor(time.getTime()/1000);
console.log(dif);
if (dif > 86400) {
    console.log('passed');
}
else{
    console.log('not passed');
}

//const tableTime = sqlToJsDate();
//console.log(tableTime);

}
init();


modules.export = {
    confirmTransaction: async function(address){
        var addressDetails = await checkAddressExists(address);
        if (!addressDetails){
            setDepositor(address);
            //check amount topUp
            //add to weeklycount dailycount and norequest
            //confirmed
            return true
        }
        addressDetails = addressDetails[0];
        //refresh daily limit and weekly limit 
        //check daily limit and weekly limit
        //If either are reached reject transaction
        if (!checkDailyLimit(address)){
            return false;
        }
        if (!checkWeeklyLimit(address)){
            return false;
        }
        //refresh norequests
        await resetNoRequests(address, addressDetails);
        if (addressDetails.norequests === 0){
            //check amount topUp
            //add to weeklycount dailycount and norequest
            //confirmed
            return true
        } 
        var latestAddressDetails = await checkAddressExists(address);
        latestAddressDetails = latestAddressDetails[0];
        //noRequests > 1 now we have to validate that the user has sent 32 eth to the wallet
        let depositedTx = await API.checkDeposit(address);
        if (depositedTx){
            const lastValidTx = addressDetails.validatedtx;
            const unaccountedTx = addressDetails.unaccountedtx;
            var flag = false;
            var depositedTxHashes = []
            for(let i = 0; i < depositedTx.length; i++){
                if (depositedTx[i].hash === validatedTx){
                    flag = true
                    if (depositedTx[i] !==  depositedTx.length -1){
                        if (depositedTx[i].amount === "32000000000000000000"){
                            //confirmTx
                            //check amount topUp
                            //add weeklycount dailycount
                            //add to validatedTx
                        } else if (Number(depositedTx[i].amount) < 32000000000000000000){
                            unaccountedTx += Number(depositedTx[i].amount);
                            if (unaccountedTx === 32000000000000000000) {
                                //confirmTx
                                //check amount topUp
                                //add weeklycount dailycount
                                //add to validatedTx
                            } else{
                                //update unaccounted for Tx
                                return false;
                            }
                        }
                        //greater than 32000000000?
                        

                    }
                    else{
                        //no new Tx reject transaction
                        return false;
                    }
                }
            }
            if (!flag){
                //confirmTx
                //check amount topUp
                //add weeklycount dailycount
                //add to validatedTx
            }
        }
        else{
            return false
        }
    },
}

async function checkAddressExists(address){
    const select = 'select * from depositor where address = $1';
    const value = [address]
    const result = pool.query(select.value);
    return result.rows;

}

async function setDepositor(address){
    const now = new Date();
    //const insert = 'INSERT INTO depositor (address,norequests,dailyCount,weeklyCount,firstrequesttime,dailyTime,weeklyTime,validatedtx,unaccountedtx) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';

    const insertVals = [address,1,0,0,now,now,now,"",0];
    await pool.query(insert,insertVals);
}

async function checkDailyLimit(address){
    //If daily count exists and 24hours between now and daily time has passed reset to daily count to 0 and daily time to now
    const select = 'select dailycount from depositor where address= $1'
    const values = [address]
    const result = await pool.query(select,values);
    //check time here
    if (resetDailyCount(address, result.rows[0])){
        return true;
    }
    return result.rows[0].dailycount <= 66;

}

async function resetDailyCount(address, row){
    const now = new Date();
    const dailytime = row.dailytime;
    if ((Math.floor(now.getTime()/1000 - Math.floor(dailytime.getTime()/1000))) > 86400){
        //update
        const update = 'update depositor set dailycount=0,dailytime=$1 where address= $2'
        const values = [now,address]
        await pool.query(update,values);
        return true; //daily limit has been reset
    }
    return false;
    

}

async function checkWeeklyLimit(address){
    const select = 'select weeklycount from depositor where address= $1'
    const values = [address]
    const result = await pool.query(select,values);
    if (resetWeeklyCount(address, result.rows[0])){
        return true;
    }
    return result.rows[0].weeklycount <= 330
}

async function resetWeeklyCount(address, row){
    const now = new Date();
    const weeklytime = row.weeklytime;
    if ((Math.floor(now.getTime()/1000 - Math.floor(weeklytime.getTime()/1000))) > 604800){
        //update
        const update = 'update depositor set weeklycount=0,weeklytime=$1 where address= $2'
        const values = [now,address]
        await pool.query(update,values);
        return true; //weekly limit has been reset
    }
    return false;
}

async function resetNoRequests(address, row){
    const now = new Date();
    const firstrequesttime = row.firstrequesttime;
    if ((Math.floor(now.getTime()/1000 - Math.floor(firstrequesttime.getTime()/1000))) > 172800){
        //update
        const update = 'update depositor set norequests=0,firstrequesttime=$1 where address= $2'
        const values = [now,address]
        await pool.query(update,values);
        return true; //daily limit has been reset
    }
    return false;
}

async function updateCounts(addressDetails,topUpAmount){
    var newDailyCount = addressDetails.dailycount + topUpAmount;
    var newWeeklyCount = addressDetails.weeklycount + topUpAmount;
    
    const update = 'update depositor set dailycount= $1,weeklycount= $2 where address= $3';
    const values = [newDailyCount,newWeeklyCount, addressDetails.address];
    await pool.query(update,values);

}
async function updateValidatedTx(addressDetails,newValidatedTx){
    const update = 'update depositor set validatedtx= $1 where address= $2';
    const values = [newValidatedTx, addressDetails.address]
    await pool.query(update,values);
}

async function updateUnaccountedTx(addressDetails, newAmount){
    var newUnaccountedTx = addressDetails.unaccountedtx + newAmount;
    const update = 'update depositor set unaccountedtx= $1 where address= $2';
    const values = [newUnaccountedTx, addressDetails.address]
    await pool.query(update,values);
}

//async function deleteAddressAfterWeek(){}
//validated transaction count conditions
//if it is in list confirm with next transaction hash 
// if it is the last elem do not confirm transaction
// if it is not in the list use the first index


