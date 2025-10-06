const chatform=document.getElementById('message-input');
const chatbox=document.getElementById('messages')
const socket=io();
const hallName=document.getElementById('currenthall');
const MemList=document.getElementById('memberList');

//query string extraction
const {username,hall}=Qs.parse(location.search,{ignoreQueryPrefix:true});
socket.emit('joinHall',{username,hall});
document.getElementById('currentUser').innerText=username;
socket.on('hallMems',({hall,users})=>{
outputHallname(hall);
outputMembers(users);
});

socket.on('Message',message=>{
   // console.log(message);
    outputMessage(message);
    chatbox.scrollTop=chatbox.scrollHeight;
});

function outputMessage(message){
    const a= document.createElement('div');
    a.classList.add('message');
    /*if(username==message.username){
    a.classList.add('sent');}
    else if(message.username=='HallsManager'){
        a.classList.add('manager');
    }
    else{*/
    a.classList.add('received'); 
    //}
    a.innerHTML=`<br>${message}`;//<span>${message.username}</span><span class="time" >${message.time}</span><br>${message.text}
    document.querySelector('.messages').appendChild(a);
}
// message submit
chatform.addEventListener('submit',(e)=>{e.preventDefault();
    const msg=e.target.elements.messageBox.value;
    socket.emit('chatMessage',msg);
    e.target.elements.messageBox.value='';
    e.target.elements.messageBox.focus();

})


//Room details 

function outputHallname(hall){
    hallName.innerText=hall;

}
function outputMembers(users){
    MemList.innerHTML=`${users.map(user=>`<li>${user.username}</li>`).join('')}`;
}



//for changing hall

const a=document.getElementById('joinhallBtn');

a.addEventListener('click',(event)=>{
    event.preventDefault();
    const newHall= document.getElementById('hallSelect').value;
    window.location.href='chat.html'+`?username=${username}&hall=${newHall}`;

});




//code frame fature
document.getElementById('fileBtn').addEventListener('click', function () {
    document.getElementById('fileUpload').click();
});

document.getElementById('fileUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result.trim();
            if (text.length > 0) {
                // Call your existing send message function
                outputMessage(text);
            } else {
                alert("The file is empty.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Only .txt files are supported.");
    }

    // Reset file input so same file can be reselected
    e.target.value = '';
});