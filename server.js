const express=require('express');
const path= require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMsg=require('./utils/messages');
//create server
const app=express();
const server=http.createServer(app);
const io =socketio(server);

const mngrName='Manager';

// static folders
app.use(express.static(path.join(__dirname,'public')));

//runs when client connects

io.on('connection',socket=>{
    socket.emit('Message',formatMsg(mngrName,'Welcome to TalkHalls!'));

    //when people join or leave
    socket.broadcast.emit('Message',formatMsg(mngrName,'A user has joined the chat'));
    socket.on('disconnect',()=>{
        io.emit('Message',formatMsg(mngrName,'A user has left the chat'));
    });
      socket.on('chatMessage',(msg)=>{io.emit('Message',formatMsg('User',msg))});
    });

const PORT= 3000 || process.env.PORT;
server.listen(PORT,()=>console.log(`Server running on PORT ${PORT}`));