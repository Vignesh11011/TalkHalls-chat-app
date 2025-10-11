import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyD0Owy8TdneTmE_dIZAsxyhSxSUJHVV410",
  authDomain: "talkhalls.firebaseapp.com",
  projectId: "talkhalls",
  storageBucket: "talkhalls.firebasestorage.app",
  messagingSenderId: "1021364253106",
  appId: "1:1021364253106:web:f27a149a3117d265f834ab"
};
const appFB = initializeApp(firebaseConfig);
const db = getFirestore(appFB);
const storage = getStorage(appFB);
const socket = io();
const chatbox = document.getElementById('messages');
const chatform = document.getElementById('message-input');
const hallName = document.getElementById('currenthall');
const MemList = document.getElementById('memberList');

const attachBtn = document.getElementById('attachBtn');
const puffPanel = document.getElementById('puffPanel');
const fileInput = document.getElementById('fileInput');
const puffNameInput = document.getElementById('puffName');
const sendPuffBtn = document.getElementById('sendPuff');
const sendFileBtn = document.getElementById('sendFile');
const cancelPuffBtn = document.getElementById('cancelPuff');
const copyAlert = document.getElementById('copyAlert');

const { username, hall } = Qs.parse(location.search, { ignoreQueryPrefix: true });
document.getElementById('currentUser').innerText = username;
socket.emit('joinHall', { username, hall });
loadPreviousChats(hall);
function formatFirestoreTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadPreviousChats(hall) {
  const q = query(collection(db, "halls", hall, "messages"), orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    data.time = formatFirestoreTime(data.timestamp);
    if (data.type === "file") renderFileMessage(data);
    else renderMessage(data);
  });
  chatbox.scrollTop = chatbox.scrollHeight;
}

// --- socket listeners ---
socket.on('hallMems', ({ hall, users }) => {
  hallName.innerText = hall;
  MemList.innerHTML = users.map(u => `<li>${escapeHtml(u.username)}</li>`).join('');
});

socket.on('Message', message => {
  renderMessage(message);
  chatbox.scrollTop = chatbox.scrollHeight;
});

socket.on('fileMessage', msg => {
  renderFileMessage(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
});

// --- send normal chat ---
chatform.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = e.target.elements.messageBox;
  const text = input.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  await addDoc(collection(db, "halls", hall, "messages"), {
  username,
  text,
  type: "text",
  timestamp: serverTimestamp()
});

  input.value = '';
  input.focus();
});

// --- render functions (safe, preserve newlines) ---
function renderMessage(message) {
  const container = document.createElement('div');
  container.classList.add('message');

  let typeClass = 'received';
  let userClass = 'username-received';
  if (message.username === username) { typeClass = 'sent'; userClass = 'username-sent'; }
  else if (message.username === 'HallsManager') { typeClass = 'manager'; userClass = 'username-manager'; }

  container.classList.add(typeClass);

  // header
  const header = document.createElement('div');
  header.className = 'message-header';
  const nameSpan = document.createElement('span');
  nameSpan.className = userClass;
  nameSpan.textContent = message.username;
  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  timeSpan.textContent = message.time || '';
  header.appendChild(nameSpan);
  header.appendChild(timeSpan);

  // message body
  const body = document.createElement('div');
  body.className = 'message-text';
  body.textContent = message.text; // preserve newlines

  container.appendChild(header);
  container.appendChild(body);

  // Copy on click (except HallsManager)
 // Copy button (top-right)
if (message.username !== 'HallsManager') {
  const copyBtn = document.createElement('button');
  copyBtn.innerHTML = 'Copy';
  copyBtn.className = 'copy-btn';
  copyBtn.title = 'Copy message';
  copyBtn.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    try {
      await navigator.clipboard.writeText(message.text);
      showCopyAlert();
    } catch {
      alert("Failed to copy text.");
    }
  });
  header.appendChild(copyBtn);
}


  chatbox.appendChild(container);
}

function renderFileMessage(msg) {
  const container = document.createElement('div');
  container.classList.add('message', msg.username === username ? 'sent' : 'received');

  const header = document.createElement('div');
  header.className = 'message-header';
  const nameSpan = document.createElement('span');
  nameSpan.className = msg.username === username ? 'username-sent' : 'username-received';
  nameSpan.textContent = msg.username;
  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  timeSpan.textContent = msg.time || '';
  header.appendChild(nameSpan);
  header.appendChild(timeSpan);

  const body = document.createElement('div');
  body.className = 'message-text';
  const a = document.createElement('a');
  a.download = msg.filename || 'file';
  a.href = msg.fileDataUrl;
  a.textContent = `Download ${msg.filename || 'file'}`;
  body.appendChild(a);

  container.appendChild(header);
  container.appendChild(body);
  chatbox.appendChild(container);
}

// --- copy alert animation ---
function showCopyAlert() {
  copyAlert.classList.remove('hidden');
  copyAlert.classList.add('show');
  setTimeout(() => {
    copyAlert.classList.remove('show');
    copyAlert.classList.add('hidden');
  }, 1200);
}

// --- attach/puff panel controls ---
attachBtn.addEventListener('click', () => {
  puffPanel.classList.toggle('hidden');
});
cancelPuffBtn.addEventListener('click', () => {
  puffPanel.classList.add('hidden');
  fileInput.value = '';
  puffNameInput.value = '';
});

function isAllowedFileName(name) {
  const lower = name.toLowerCase();
  return ['.c', '.cpp', '.java', '.py', '.txt', '.js', '.json', '.md'].some(ext => lower.endsWith(ext));
}

// --- send Puff ---
sendPuffBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');
  if (!isAllowedFileName(file.name)) return alert('Unsupported file type.');

  let text;
  try {
    text = await file.text();
  } catch {
    return alert('Unable to read file');
  }

  const puffName = puffNameInput.value.trim();
  let toSend = text;

  // Extract snippet between tags if puff name is provided
  if (puffName) {
    const lines = text.split(/\r?\n/);
    const positions = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`$T${puffName}$T`)) positions.push(i);
    }
    if (positions.length >= 2) {
      const snippet = lines.slice(positions[0] + 1, positions[1]).join('\n');
      toSend = snippet || text;
    } else {
      return alert(`Puff '${puffName}' not found.`);
    }
  }

  // Get current user info
  const messageData = {
    username,
    text:toSend,
    type: "puff",
    timestamp:serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "halls", hall, "messages"),messageData);
    console.log("Puff saved to Firestore!");
  } catch (err) {
    console.error("Error saving puff:", err);
  }

  // Send to Socket.IO for live chat
  socket.emit('chatMessage', toSend);

  // Reset UI
  puffPanel.classList.add('hidden');
  fileInput.value = '';
  puffNameInput.value = '';
});


// --- send File ---
sendFileBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');
  const reader = new FileReader();
  reader.onload = e => {
    socket.emit('fileUpload', { filename: file.name, dataUrl: e.target.result });
    puffPanel.classList.add('hidden');
    fileInput.value = '';
    puffNameInput.value = '';
  };
  reader.readAsDataURL(file);
});

// --- helper ---
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[t]));
}

const a=document.getElementById('joinhallBtn');

a.addEventListener('click',(event)=>{
    event.preventDefault();
    const newHall= document.getElementById('hallSelect').value;
    window.location.href='chat.html'+`?username=${username}&hall=${newHall}`;

});