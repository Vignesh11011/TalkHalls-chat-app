 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import{getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
  import {getFirestore,setDoc,doc,getDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
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
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  function showMessage(message,divID){
    var msg=document.getElementById(divID);
    msg.style.display="block";
    msg.innerHTML=message;
    msg.style.opacity=1;
    setTimeout(function(){msg.opacity=0;},5000);
  }
  const submitBtn=document.getElementById("login-submit");


  submitBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    const username=document.getElementById("username").value;
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const hall=document.getElementById("hall").value;

    const auth=getAuth();
    const db=getFirestore();

    createUserWithEmailAndPassword(auth,email,password)
    .then((userCrd)=>{
        const user=userCrd.user;
        const userdata={email:email,password:password,username:username};
        showMessage('Account created Sucessfully','lgn-msg');
        const docRef=doc(db,"users",user.uid);
        setDoc(docRef,userdata)
        .then(()=>{
            window.location.href='chat.html'+`?username=${username}&hall=${hall}`;
        })
        .catch((error)=>{console.error("error writing document",error);

        });
    })
    .catch((error)=>{
        const ec=error.code;
        if(ec=='auth/email-already-in-use'){
            showMessage('Email Already Exist','lgn-msg');
        }
        else{
            showMessage('User Cannot Be Created!!','lgn-msg');
            console.log(ec);
        }
    });
  });


  // for login page