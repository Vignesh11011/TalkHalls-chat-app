const express=require('express');
const path= require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMsg=require('./utils/messages');
const {userJoin,currentUser,userLeave,getRoomlist}=require('./utils/users');
//create server
const app=express();
const server=http.createServer(app);
const io =socketio(server);

const mngrName='HallsManager';

// static folders
app.use(express.static(path.join(__dirname,'public')));

//runs when client connects

io.on('connection',socket=>{

    socket.on('joinHall',({username,hall})=>{
      const user=userJoin(socket.id,username,hall);
      socket.join(user.hall);

      socket.emit('Message',formatMsg(mngrName,'Welcome to TalkHalls!'));
      //when people join or leave
      socket.broadcast.to(user.hall).emit('Message',formatMsg(mngrName,`${user.username} has joined the chat`));

      io.to(user.hall).emit('hallMems',{hall:user.hall,users:getRoomlist(user.hall)});

    });

      socket.on('chatMessage',(msg)=>{
        const user=currentUser(socket.id);
        io.to(user.hall).emit('Message',formatMsg(user.username,msg))
      });
      
    socket.on('disconnect',()=>{
      const user=userLeave(socket.id);
      if(user){
        io.to(user.hall).emit('Message',formatMsg(mngrName,`${user.username} has left the chat`));
        io.to(user.hall).emit('hallMems',{hall:user.hall,users:getRoomlist(user.hall)});
      }
    });

    });

const PORT= 3000 || process.env.PORT;
server.listen(PORT,()=>console.log(`Server running on PORT ${PORT}`));