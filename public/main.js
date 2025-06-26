const chatform=document.getElementById('message-input');
const chatbox=document.getElementById('messages')
const socket=io();
socket.on('Message',message=>{
    console.log(message);
    outputMessage(message);
    chatbox.scrollTop=chatbox.scrollHeight;
});

function outputMessage(message){
    const a= document.createElement('div');
    a.classList.add('message');
    a.classList.add('sent');
    a.innerHTML=`<span>${message.username}</span><span class="time">${message.time}</span><br>${message.text}`;
    document.querySelector('.messages').appendChild(a);
}
// message submit
chatform.addEventListener('submit',(e)=>{e.preventDefault();
    const msg=e.target.elements.messageBox.value;
    socket.emit('chatMessage',msg);
    e.target.elements.messageBox.value='';
    e.target.elements.messageBox.focus();

})