const { checkDeposit } = require('./api.js');
const { Pool } = require('pg');
let pool = new Pool({
    user: 'hamzaasaad',
    host: 'localhost',
    database: 'hamzaasaad',
    password: null,
    port: 5431,
  })
pool.connect();

pool.query('SELECT NOW()', (err, res) => {
    if(err){
        console.log('Database connection failed',err);
    }
    else {
        console.log('Database connected!');
    }
  });

const createTable = `create table depositortest(
    address VARCHAR,
    norequests INT,
    dailyCount INT,
    weeklyCount INT,
    firstrequesttime TIMESTAMP WITHOUT TIME ZONE,
    dailyTime TIMESTAMP WITHOUT TIME ZONE,
    weeklyTime TIMESTAMP WITHOUT TIME 100000000000000ZONE

)`

const depositAmount = "1000000000000000"; //should be 32000000000000000000
const dailyLimit = 0.002;
const weeklyLimit = 0.004;



module.exports = {
    confirmTransaction: async function(address, topUpAmount){
        //add try catch

        var addressDetails = (await checkAddressExists(address));
        //console.log("Check account exists address details:",addressDetails);
        //Assumes addressDetails will always be an array
        if (!addressDetails.length){
            const addressDetails = await setDepositor(address);
            await updateCounts(addressDetails, topUpAmount);
            return true
        }
        addressDetails = addressDetails[0];
        //refresh daily limit and weekly limit 
        //check daily limit and weekly limit
        //If either are reached reject transaction
        if (!(await checkDailyLimit(addressDetails))){
            return false;
        }
        if (!(await checkWeeklyLimit(addressDetails))){
            return false;
        }
        //refresh norequests
        const norequests = await resetNoRequests(addressDetails);
        if (norequests === 0){
            await updateCounts(addressDetails, topUpAmount);
            return true
        } 
        addressDetails = (await checkAddressExists(address))[0];
        //noRequests > 1 now we have to validate that the user has sent 32 eth to the wallet
        return await validateTransaction(addressDetails, topUpAmount);
    },
}

async function checkAddressExists(address){
    const select = `
        SELECT * FROM depositortest 
        WHERE address = $1
    `;
    const value = [address]
    const result = await pool.query(select,value);
    return result.rows;

}

async function setDepositor(address){
    const now = new Date();
    const insert = `
        INSERT INTO depositortest 
            (address,norequests,dailyCount,weeklyCount,firstrequesttime,dailyTime,weeklyTime,validatedtx,unaccountedamount,unaccountedtx) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
        `
    const insertVals = [address,1,0,0,now,now,now,"",0,""];
    var result = await pool.query(insert, insertVals);
    console.log(result);
    result = {
        address: address,
        norequests: 1,
        dailycount: 0,
        weeklycount: 0,
        firstrequesttime: now,
        dailytime: now,
        weeklytime: now,
        validatedTx: "",
        unaccountedamount: 0,
        unaccountedamount: ""
    }
    return result;
}

async function checkDailyLimit(addressDetails){
    const dailycount = await resetDailyCount(addressDetails);
    console.log(dailycount);
    return dailycount <= dailyLimit;

}

async function resetDailyCount(addressDetails){
    const now = new Date();
    // console.log(addressDetails);
    const address = addressDetails.address;
    const dailytime = addressDetails.dailytime;
    if ((Math.floor(now.getTime()/1000 - Math.floor(dailytime.getTime()/1000))) > 86400){
        //update
        console.log('Resetting...');
        const update = 'update depositortest set dailycount=0,dailytime=$1 where address= $2 returning dailycount'
        const values = [now,address]
        const dailycount = await pool.query(update,values);
        return dailycount.rows[0].dailycount; //daily limit has been reset
    }
    return addressDetails.dailycount;
    

}

async function checkWeeklyLimit(addressDetails){
    const weeklycount = await resetWeeklyCount(addressDetails);
    return weeklycount <= weeklyLimit;
}

async function resetWeeklyCount(addressDetails){
    const now = new Date();
    const address = addressDetails.address;
    const weeklytime = addressDetails.weeklytime;

    if ((Math.floor(now.getTime()/1000 - Math.floor(weeklytime.getTime()/1000))) > 604800){
        //update
        const update = 'update depositortest set weeklycount=0,weeklytime=$1 where address= $2 returning weeklycount'
        const values = [now,address]
        const weeklycount = await pool.query(update,values);
        return weeklycount.rows[0].weeklycount; //weekly limit has been reset
    }
    return addressDetails.weeklycount;
}

async function resetNoRequests(addressDetails){
    // console.log(addressDetails)
    const now = new Date();
    const address = addressDetails.address;
    const firstrequesttime = addressDetails.firstrequesttime;
    if ((Math.floor(now.getTime()/1000 - Math.floor(firstrequesttime.getTime()/1000))) > 172800){
        //update
        const update = 'update depositortest set norequests=0,firstrequesttime=$1 where address= $2 returning norequests'
        const values = [now,address]
        const norequests = await pool.query(update,values);
        return norequests.rows[0].norequests; //daily limit has been reset
    }
    return addressDetails.norequests;
}

async function updateCounts(addressDetails,topUpAmount){
    var newDailyCount = addressDetails.dailycount + topUpAmount;
    var newWeeklyCount = addressDetails.weeklycount + topUpAmount;
    
    const update = 'update depositortest set dailycount= $1,weeklycount= $2 where address= $3';
    const values = [newDailyCount,newWeeklyCount, addressDetails.address];
    await pool.query(update,values);

}
  
async function objectRowUpdate(addressDetails){
      console.log('Inside object row:', addressDetails);
      const update = 'update depositortest set validatedtx= $1,unaccountedamount= $2, unaccountedtx= $3, dailycount= $4, weeklycount= $5 where address= $6';
      const values = [addressDetails.validatedtx, addressDetails.unaccountedamount, addressDetails.unaccountedtx, addressDetails.dailycount, addressDetails.weeklycount, addressDetails.address]
      const result = await pool.query(update, values);
  }

function getUnvalidatedTx(depositedTx, lastValidatedTx){
  let index = null;
  for (let i=0; i < depositedTx.length; i++){
    if (depositedTx[i].hash == lastValidatedTx){
      index = i;
    }
  }
  if (index){
    return depositedTx.slice(0, index);
  }else{
    return depositedTx;
  }
}

async function validateTransaction(addressDetails, topUpAmount){   // make a column for unaccountedAmount in db
        let lastValidatedTx = addressDetails.validatedtx;
        console.log(addressDetails.address);
        let depositedTx = getUnvalidatedTx((await checkDeposit(addressDetails.address)), lastValidatedTx); // confirm checkDeposit.confirmTransaction function
        console.log(depositedTx);
        let depositComplete = false;
        if (depositedTx){
          if (lastValidatedTx){
            for (let i = 0; i < depositedTx.length; i++){
                if ((Number(depositedTx[i].amount) == depositAmount) && (depositedTx[i].hash != lastValidatedTx) && addressDetails.unaccountedamount < Number(depositAmount)){
                depositComplete = true;
                addressDetails.validatedtx = depositedTx[i].hash;
                addressDetails.weeklycount += topUpAmount;
                addressDetails.dailycount += topUpAmount;
                await objectRowUpdate(addressDetails);
              }else if ((Number(depositedTx[i].amount) < depositAmount) && (depositedTx[i].hash != lastValidatedTx)){
                addressDetails.unaccountedamount +=  Number(depositedTx[i].amount);
                addressDetails.unaccountedtx = depositedTx[i].hash;
                await objectRowUpdate(addressDetails);
              }else if ((Number(depositedTx[i].amount) > depositAmount) && (depositedTx[i].hash != lastValidatedTx)){
                addressDetails.unaccountedtx = depositedTx[i].hash;
                addressDetails.unaccountedamount += (Number(depositedTx[i].amount) - depositAmount);
                await objectRowUpdate(addressDetails);
              }}}
          else{
            for (let i = 0; i < depositedTx.length; i++){
                if ((Number(depositedTx[i].amount) == depositAmount) && (depositedTx[i].hash != lastValidatedTx) && addressDetails.unaccountedamount < depositAmount){
                depositComplete = true;
                addressDetails.validatedtx = depositedTx[i].hash;
                addressDetails.weeklycount += topUpAmount;
                addressDetails.dailycount += topUpAmount;
                await objectRowUpdate(addressDetails);
                depositComplete = true;
              }else if ((Number(depositedTx[i].amount) < depositAmount) && (depositedTx[i].hash != lastValidatedTx)){
                addressDetails.unaccountedamount +=  Number(depositedTx[i].amount);
                addressDetails.unaccountedtx = depositedTx[i].hash;
                await objectRowUpdate(addressDetails);
              }else if ((Number(depositedTx[i].amount) > depositAmount) && (depositedTx[i].hash != lastValidatedTx)){
                addressDetails.unaccountedtx = depositedTx[i].hash;
                addressDetails.unaccountedamount += (Number(depositedTx[i].amount) - depositAmount);
                await objectRowUpdate(addressDetails);
              }}}
          if ((addressDetails.unaccountedamount >= depositAmount) && !(depositComplete)){
            addressDetails.unaccountedamount -= depositAmount;
            addressDetails.validatedtx = addressDetails.unaccountedtx;
            addressDetails.unaccountedtx = '';
            addressDetails.weeklycount += depositAmount;
            addressDetails.dailycount += depositAmount;
            depositComplete = true;
            await objectRowUpdate(addressDetails);
          } 
          console.log(addressDetails);
          return depositComplete;
        }else{
          return false;
      }
  }
       
/*
async function updateValidatedTx(addressDetails,newValidatedTx){
    //console.log(addressDetails, newValidatedTx);
    const update = 'update depositortest set validatedtx=$1 where address=$2 returning address;';
    const values = [newValidatedTx, addressDetails.address]
    const result = await pool.query(update,values);
    //console.log(result);
}

async function updateUnaccountedTx(addressDetails, newTx, newAmount){
    var newUnaccountedAmount = addressDetails.unaccountedamount + newAmount;
    const update = 'update depositortest set unaccountedamount= $1, unaccountedtx= $2  where address=$3';
    const values = [newUnaccountedTx,newTx, addressDetails.address]
    const result = await pool.query(update,values);
    //console.log(result);

}*/