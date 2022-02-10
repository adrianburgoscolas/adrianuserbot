const db = require("../controllers/db")
module.exports = function(app){
    app.get("/data/:tf", async (req,res)=>{
        
        try{
            const dataset = await db.getDataset(req.params.tf)
            res.json(dataset);
        }catch(e){
            console.log(e)
        }
    });
};