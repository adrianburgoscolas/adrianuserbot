const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const { Schema } = mongoose;
const DataSchema = new Schema({
    price: Number,
    date: Number,
    currency: String
});

let CurrencyData = mongoose.model("CurrencyData", DataSchema);

class DbHandler {

    //get last datapoint from db
    async getLastDataPoint(){
        try{
            const data = await CurrencyData.findOne().sort({date: -1})
            return data;
        }catch(e){
            console.log(e)
        }
    }

    //save last adquired dataset to db
    async saveDataset(arr){
        for(let i = 0; i < arr.length; ++i ){
           const data = new CurrencyData({
               price: arr[i].price,
               date: arr[i].date,
               currency: arr[i].currency
           }); 
           try{
            const newData = await data.save();
           }catch(e){
               console.log(e)
           }
        }
    }

    //get dataset by time frame from db
    async getDataset(tf){
        try{
            let outDataset = [];
            //find last datapoint
            const lastDataPoint = await CurrencyData.findOne().sort({date: -1})

            if(tf == "1d"){//1 day time frame dataset
                let dataset = await CurrencyData.find({date: {$gte: lastDataPoint.date - 86400000}})
                
                const usdtArray = dataset.filter((obj)=>{return /usdt/i.test(obj.currency)});
                let usdtMean = usdtArray.reduce((prev,val,i)=>prev + val.price,0)/usdtArray.length;
                const usdtVariance = usdtArray.map((obj)=>{return (obj.price - usdtMean) ** 2}).reduce((acm, val)=>acm + val, 0)/usdtArray.length;
                const usdtSd = Math.sqrt(usdtVariance);
                const newUsdtArray = usdtArray.filter((obj)=>obj.price < usdtMean + 2 * usdtSd && obj.price > usdtMean - 2 * usdtSd);

                const usdArray = dataset.filter((obj)=>{return /usd$/i.test(obj.currency)});
                let usdMean = usdArray.reduce((prev,val,i)=>prev + val.price,0)/usdArray.length;
                const usdVariance = usdArray.map((obj)=>{return (obj.price - usdMean) ** 2}).reduce((acm, val)=>acm + val, 0)/usdArray.length;
                const usdSd = Math.sqrt(usdVariance);
                const newUsdArray = usdArray.filter((obj)=>obj.price < usdMean + 2 * usdSd && obj.price > usdMean - 2 * usdSd);

                const mlcArray = dataset.filter((obj)=>{return /mlc/i.test(obj.currency)});
                let mlcMean = mlcArray.reduce((prev,val,i)=>prev + val.price,0)/mlcArray.length;
                const mlcVariance = mlcArray.map((obj)=>{return (obj.price - mlcMean) ** 2}).reduce((acm, val)=>acm + val, 0)/mlcArray.length;
                const mlcSd = Math.sqrt(mlcVariance);
                const newMlcArray = mlcArray.filter((obj)=>obj.price < mlcMean + 2 * mlcSd && obj.price > mlcMean - 2 * mlcSd);
                
                
                return [...newUsdtArray, ...newUsdArray, ...newMlcArray];

            }else if(tf == "7d"){//7 days time frame dataset
                let weekDataset = [[]];
                const dataset = await CurrencyData.find({date: {$gte: lastDataPoint.date - 604800000}})

                //12h(43200000) resolution to calculate the mean of a single datapoint
                const offset = 43200000;

                let reference = dataset[0].date
                let i = 0;
                dataset.forEach((obj)=>{
                    if(obj.date < reference + offset){
                        weekDataset[i].push(obj)
                    }else{
                        reference = obj.date;
                        weekDataset.push([obj])
                        ++i;
                    }
                });
                
                weekDataset.forEach((arr)=>{
                    let usdtArray = arr.filter((obj)=>{return /usdt/i.test(obj.currency)});
                    
                    let usdArray = arr.filter((obj)=>{return /usd/i.test(obj.currency)});
                    let mlcArray = arr.filter((obj)=>{return /mlc/i.test(obj.currency)});
                    let usdtMean = usdtArray.reduce((prev,val,i)=>prev + val.price,0)/usdtArray.length;
                    let usdMean = usdArray.reduce((prev,val,i)=>prev + val.price,0)/usdArray.length;
                    let mlcMean = mlcArray.reduce((prev,val,i)=>prev + val.price,0)/mlcArray.length;
                    if(usdtArray.length !== 0){
                        outDataset.push({price: usdtMean, date: usdtArray[usdtArray.length - 1].date, currency: "usdt"});
                    }
                    if(usdArray.length !== 0){
                        outDataset.push({price: usdMean, date: usdArray[usdArray.length - 1].date, currency: "usd"});
                    }
                    if(mlcArray.length !== 0){
                        outDataset.push({price: mlcMean, date: mlcArray[mlcArray.length - 1].date, currency: "mlc"});
                    }
                    
                });
                return outDataset;
                
            }
            
        }catch(e){
            console.log(e);
        }
    }
};

const db = new DbHandler();
module.exports = db;