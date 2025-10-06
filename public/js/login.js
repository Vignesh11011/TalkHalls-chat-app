 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import{getAuth,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
  import {getFirestore,doc,getDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
 //import config from 'dotenv';
  // Your web app's Firebase configuration
  const firebaseConfig ={
    apiKey: "AIzaSyD0Owy8TdneTmE_dIZAsxyhSxSUJHVV410",
    authDomain: "talkhalls.firebaseapp.com",
    projectId: "talkhalls",
    storageBucket: "talkhalls.firebasestorage.app",
    messagingSenderId: "1021364253106",
    appId: "1:1021364253106:web:f27a149a3117d265f834ab"
  };;

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  function showMessage(message,divID){
    var msg=document.getElementById(divID);
    msg.style.display="block";
    msg.innerHTML=message;
    msg.style.opacity=1;
    setTimeout(function(){msg.opacity=0;},5000);
  }
  const signIn=document.getElementById("enterBtn");

  // for login page
  signIn.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const hall=document.getElementById("hall").value;
    const auth=getAuth();
    const db=getFirestore();
    signInWithEmailAndPassword(auth, email,password)
    .then((userCredential)=>{
        showMessage('login is successful', 'lgn-msg');
        const user=userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        const docRef=doc(db,'users',user.uid);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data().username;
                window.location.href='chat.html'+`?username=${userData}&hall=${hall}`;
            }
        })
        .catch((error)=>{
            console.log("Error getting data");
        });
        
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode==='auth/invalid-credential'){
            showMessage('Incorrect Email or Password', 'lgn-msg');
        }
        else{
            showMessage('Account does not Exist', 'lgn-msg');
        }
    })
 })
