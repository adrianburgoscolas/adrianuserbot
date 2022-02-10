const express = require("express");
const { Socket } = require("socket.io");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("dotenv").config();
const routes = require("./routes/routes")
const auth = require("./controllers/auth")
// const mtproto = require("./controllers/mtproto").mtproto
const cron = require("./controllers/cron")
const cors = require('cors');

app.use(cors({origin: '*'}));

app.use("/public",express.static(process.cwd() + "/public"))

//index page
app.get("/",(req,res)=>{
    res.sendFile(process.cwd() + "/views/index.html")
});

//api routes
routes(app);
let signed;

io.on("connection", async (socket)=>{
    socket.on("disconnect",()=>{});
    
    const phone = process.env.PHONE;
    const phone_code_hash = await auth.sendCode(phone);
    if(phone_code_hash){
        io.emit("askcode","send code")
    }

    socket.on("code", async (code)=>{
        
        signed = await auth.signInCode(code, phone, phone_code_hash);
    });

    
});

//24h time frame data adquisition to db at server run time
cron();

//24h time frame data adquisition to db checked every hour
setInterval(cron,3600000);

//receiving updates ok
// mtproto.updates.on('updates', (updateInfo) => {
//     console.log(updateInfo)
// });

//404 not found middleware
app.use(function(req,res,next){
    res.status(404)
    .type("text")
    .send("Not Found");
});

const port = process.env.PORT || 3000;
server.listen(port,()=>{
    console.log(`listening on port ${port}!`)
});