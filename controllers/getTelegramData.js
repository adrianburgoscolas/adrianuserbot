//returns a dataset(array) of objects {price: Number, date: String} of the last 24h from a telegram channel
const api = require("./mtproto");
const auth = require("./auth");

const data = async () => {
   
    const user = await auth.getUser();

  if(user){
    try{
        console.log("active user: ", user.user.username);
        
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
        
          const LIMIT_COUNT = 50;
          const allMessages = [];
          let offset = 0;
            let a = true;
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
        
          let filterByItem = allMessages.filter((obj)=>{
                return /usdt/i.test(obj.message)
          });

          let dataSet = [];
          filterByItem.forEach((obj)=>{
            let parsedMessage = obj.message.match(/^(?!.*compro).*usdt.*a (\d+\.?\d+)/i)
            if(parsedMessage && Number(parsedMessage[1]) > 25){
              dataSet.unshift({
                  price: Number(parsedMessage[1]),
                  date: obj.date * 1000
                })
            }
          });
          return dataSet;

      }catch(e){
          console.log(e);
          return null;
      }
  }else{
    console.log("authorization needed");
  }
 
};

  module.exports = data;