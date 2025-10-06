const users=[];
function userJoin(id,username,hall){
    const user={id,username,hall};
    users.push(user);
    return user;
}
function currentUser(id){
    return users.find(user=>user.id===id);
}

function userLeave(id){
    const index=users.findIndex(user=>user.id===id);
    if(index!=-1){
        return users.splice(index,1)[0];
    }
}
function getRoomlist(hall){
    return users.filter(user=>user.hall===hall);
}
module.exports={userJoin,currentUser,userLeave,getRoomlist};