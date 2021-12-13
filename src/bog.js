const { Pool } = require('pg');
const { request } = require('express');
const pool = new Pool({
    user: 'hamzaasaad',
    host: 'localhost',
    database: 'hamzaasaad',
    password: null,
    port: 5431,
  })
pool.connect();

var time = new Date();
time.setDate(time.getDate() - 1);
console.log(time);


const update = 'update depositortest set firstrequesttime= $1, dailytime= $1, weeklytime= $1 where address= $2';
const values = [time,'0x066Adead2d82A1C2700b4B48ee82ec952b6b18dA'];
const result = pool.query(update,values);
pool.end();
console.log(result);

/*
async function confirm_transaction(addressDetails){   // make a column for unaccountedAmount in db
    let FAUCET_ADDRESS = ""
    let depositedTx = API.checkDeposit(addressDetails);
    let lastValidatedTx = addressDetails.validatedtx
    if (depositedTx){
      if (lastValidatedTx){
        for (let i; i < depositedTx.length; i++){
          if (depositedTx[i].amount == "32000000000000000000" && depositedTx[i].hash != lastValidatedTx && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.weeklyCount += 33;
            addressDetails.dailyCount += 33;
            //update time in db
            addressDetails.validatedtx = depositedtx[i].hash
            //db.commit()
            return
          }else if (Number(depositedTx[i].amount) < 32000000000000000000 && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.unaccountedAmount += Number(depositedTx[i].amount)
            addressDetails.unaccountedTx = depositedTx[i].hash
            //db.commit()
  
          }else if (Number(depositedTx[i].amount) > 32000000000000000000 && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.unaccountedAmount += 32000000000000000000 - Number(depositedTx[i].amount)
            addressDetails.unaccountedTx = depositedTx[i].hash
            //db.commit()
          }
        }
      }else{
        for (let i; i < depositedTx.length; i++){
          if (depositedTx[i].amount == "32000000000000000000" && depositedTx[i].hash != last_validated_tx && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.validatedtx = depositedtx[i].hash
            addressDetails.weeklyCount += 33;
            addressDetails.dailyCount += 33;
            //update time in db
            return
          }else if (Number(depositedTx[i].amount) < 32000000000000000000 && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.unaccountedAmount += Number(depositedTx[i].amount)
            addressDetails.unaccountedTx = depositedTx[i].hash
            //db.commit()
  
          }else if (Number(depositedTx[i].amount) > 32000000000000000000 && depositedTx[i].to == FAUCET_ADDRESS){
            addressDetails.unaccountedAmount += 32000000000000000000 - Number(depositedTx[i].amount)
            addressDetails.unaccountedTx = depositedTx[i].hash
            //db.commit()
          }}
      }
      if (addressDetails.unaccountedAmount >= 32000000000000000000){
            addressDetails.unaccountedAmount -= 32000000000000000000
            addressDetails.weeklyCount += 33   
            addressDetails.dailyCount += 33
            //update time in db
            addressDetails.validatedTx = addressDetails.unaccountedTx
      }
    }else{
      return false;
    }
  }*/