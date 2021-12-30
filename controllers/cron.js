const getTelegramData = require("./getTelegramData");
const db = require("./db");

const cron = async ()=>{

    const dataPoint = await db.getLastDataPoint();
    const time = new Date().getTime();
    console.log("adquiring data at " + new Date(time));
    if(time > dataPoint.date + 86400000){
        const dataset = await getTelegramData();
        await db.saveDataset(dataset);
        console.log("saved dataset with " + dataset.length + " datapoints");
    }else{
        console.log("no data to adquire: less than 24h from last adquisition")
    }
  };

  module.exports = cron;