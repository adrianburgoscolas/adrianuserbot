const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const { Schema } = mongoose;
const UsdtDataSchema = new Schema({
    price: Number,
    date: Number
});

let UsdtData = mongoose.model("UsdtData", UsdtDataSchema);

class DataHandler {

    //get last datapoint from db
    async getLastDataPoint(){
        try{
            const data = await UsdtData.findOne().sort({date: -1})
            return data;
        }catch(e){
            console.log(e)
        }
    }

    //save last adquired dataset to db
    async saveDataset(arr){
        for(let i = 0; i < arr.length; ++i ){
           const data = new UsdtData({
               price: arr[i].price,
               date: arr[i].date
           }); 
           try{
            const newData = await data.save();
            console.log(newData)
           }catch(e){
               console.log(e)
           }
        }
    }

    //get dataset by time frame from db
    async getDataset(tf){
        try{
            //find last datapoint
            const data = await UsdtData.findOne().sort({date: -1})

            if(tf == "1d"){//1 day time frame dataset
                const dataset = await UsdtData.find({date: {$gte: data.date - 86400000}})
                return dataset;

            }else if(tf == "7d"){//7 days time frame dataset
                let weekDataset = [[]];
                const dataset = await UsdtData.find({date: {$gte: data.date - 604800000}})

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
                let outDataset = [];
                weekDataset.forEach((arr)=>{
                    let meanPrice = 0;
                    let sum = 0;
                    let date = 0;
                    arr.forEach((obj)=>{
                       sum+=obj.price
                       date = obj.date
                    });
                    meanPrice = sum/arr.length
                    outDataset.push({price: meanPrice, date: date})
                });
                return outDataset;
                
            }
            
        }catch(e){
            console.log(e);
        }
    }
};

const db = new DataHandler();
module.exports = db;