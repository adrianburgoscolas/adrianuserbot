//returns a dataset(array) of objects {price: Number, date: String} of the last 24h from a telegram channel
const api = require("./mtproto");
const auth = require("./auth");

const data = async () => {
   
    const user = await auth.getUser();

  if(user){
    try{
        const resolvedPeer = await api.call('contacts.resolveUsername', {
            username: 'Divisas_Criptomonedas_Cuba',
          });
        
          const channel = resolvedPeer.chats.find(
            (chat) => chat.id === resolvedPeer.peer.channel_id
          );
        
          const inputPeer = {
            _: 'inputPeerChannel',
            channel_id: channel.id,
            access_hash: channel.access_hash,
          };
        
          const LIMIT_COUNT = 80;
          const allMessages = [];
          let offset = 0;
            // let a = true;
            let timeOffset = new Date().getTime() - 86400000;
            let lastDate = new Date().getTime();
            
          while(lastDate > timeOffset){
            const history = await api.call('messages.getHistory', {
                peer: inputPeer,
                add_offset: offset,
                limit: LIMIT_COUNT,
              });
              lastDate = history.messages[9].date * 1000;
              allMessages.push(...history.messages)
              offset+=LIMIT_COUNT;
          }
        
          // let usdtMessages = allMessages.filter((obj)=>{
          //       return /usdt/i.test(obj.message)
          // });

          // let usdMessages = allMessages.filter((obj)=>{
          //   return /usd/i.test(obj.message)
          // });

          // let mlcMessages = allMessages.filter((obj)=>{
          //   return /mlc/i.test(obj.message)
          // });

          let currenciesData = [];
          allMessages.forEach((obj)=>{
            let usdtMessage = obj.message.match(/^(?!.*compro).*usdt.*a (\d+\.?\d+)/i)
            if(usdtMessage && Number(usdtMessage[1]) > 25 && Number(usdtMessage[1]) < 500){
              currenciesData.unshift({
                  price: Number(usdtMessage[1]),
                  date: obj.date * 1000,
                  currency: "usdt"
                })
            }
            let usdMessage = obj.message.match(/^(?!.*compro).*usd.*a (\d+\.?\d+)/i)
            if(usdMessage && Number(usdMessage[1]) > 25 && Number(usdMessage[1]) < 500){
              currenciesData.unshift({
                  price: Number(usdMessage[1]),
                  date: obj.date * 1000,
                  currency: "usd"
                })
            }
            let mlcMessage = obj.message.match(/^(?!.*compro).*mlc.*a (\d+\.?\d+)/i)
            if(mlcMessage && Number(mlcMessage[1]) > 25  && Number(mlcMessage[1]) < 500){
              currenciesData.unshift({
                  price: Number(mlcMessage[1]),
                  date: obj.date * 1000,
                  currency: "mlc"
                })
            }
          });

          return currenciesData;

      }catch(e){
          console.log(e);
          return null;
      }
  }else{
    console.log("authorization needed");
  }
 
};

  module.exports = data;