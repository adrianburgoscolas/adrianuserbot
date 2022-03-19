const getTelegramData = require("./getTelegramData");
const db = require("./db");

const cron = async ()=>{

    try{
        const dataPoint = await db.getLastDataPoint();
        const time = new Date().getTime();
        console.log("adquiring data at " + new Date(time));
        if(dataPoint){
            if(time > dataPoint.date + 86400000){
                const dataset = await getTelegramData();
                // console.log(dataset)
                await db.saveDataset(dataset);
                console.log("saved dataset with " + dataset.length + " datapoints");
            }else{
                console.log("no data to adquire: less than 24h from last adquisition")
            }
        }else{
            console.log("no datapoint on db")
            const dataset = await getTelegramData();
            // console.log(dataset)
            await db.saveDataset(dataset);
            console.log("saved dataset with " + dataset.length + " datapoints");
        }
    }catch(e){
        console.log(e,"error reading db");
    }
  };

  module.exports = cron;