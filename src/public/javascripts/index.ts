import axios from "axios";

const storage = window.localStorage;

const ID = storage.peer ? storage.peer : [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
if(!storage.peer) storage.setItem("peer", ID);
if(!storage.peer_messages) storage.setItem("peer_messages", `{"0":"0"}`);

const peerMessages = JSON.parse(storage.peer_messages);

const oldMessages = (peerID) => {
  document.getElementById("connection").innerHTML = `Connected to ${peerID}.`
  document.getElementById("messages").innerHTML = "";
  if(!peerMessages[peerID]) {
    peerMessages[peerID] = [];
    storage.peer_messages = JSON.stringify(peerMessages);
  }
  if(peerMessages[peerID].length !== 0)
    peerMessages[peerID].forEach( (a) => {
      document.getElementById("messages").innerHTML = `<br> ${a[0]}: ${a[1]} ${a[2]} ${document.getElementById("messages").innerHTML}`;
    });
}

const selectPeerID = document.getElementById("otherPeerID").options;
for(const id in peerMessages)
  selectPeerID.add(new Option(id));

const messagesHistory = () => {
  otherMessages.innerHTML = "";
  selectedID.innerHTML = "";
  const id = document.getElementById("otherPeerID").value;
  if(id !== "0") {
    selectedID.innerHTML = id;
    peerMessages[id].forEach( (a) => {
      otherMessages.innerHTML = `<br> ${a[0]}: ${a[1]} ${a[2]} ${otherMessages.innerHTML}`;
    });
  }
}
document.getElementById("otherPeerID").onchange = messagesHistory;

const data = axios({
    method: "post",
    url: "/config",
    responseType: "json",
  })
  .then(res => {return res.data;})
  .catch(e => {console.log(e.message);});
const peer = new Peer(ID, await data);

peer.on("open", (id) => {
  document.getElementById("selfID").innerHTML = `Your ID is ${id}.`;
});

let conn = null;
const sendPeerID = () => {
  const peerID = document.getElementById("peerID").value;
  conn = peer.connect(peerID);
  conn.on("open", () => {
    oldMessages(peerID);
    conn.on("data", (message) => getMessage(message));
  });
  conn.on("close", () => {
    document.getElementById("connection").innerHTML = "Connection closed by peer.";
  });
}
document.getElementById("connectButton").addEventListener("click", sendPeerID);

const sendMessage = () => {
  const message = document.getElementById("message").value;
  conn.send(message);
  const date = new Date();
  document.getElementById("messages").innerHTML = `<br> Self: ${date} ${message} ${document.getElementById("messages").innerHTML}`;
  const peerID = conn.peer;
  const peerMessages = JSON.parse(storage.peer_messages); 
  peerMessages[peerID].push(["Self", date, message]);
  storage.peer_messages = JSON.stringify(peerMessages);
}
document.getElementById("messageButton").addEventListener("click", () => { 
  if(conn && conn._open) 
    sendMessage();
});

const getPeerID = () => {
  const peerID = conn.peer;
  conn.on("open", () => {
    oldMessages(peerID);
  });
  conn.on("close", () => {
    document.getElementById("connection").innerHTML = "Connection closed by peer.";
  });
}
const getMessage = (message) => {
  const peerID = conn.peer;
  const date = new Date();
  document.getElementById("messages").innerHTML = `<br> Peer: ${date} ${message} ${document.getElementById("messages").innerHTML}`;
  const peerMessages = JSON.parse(storage.peer_messages);
  peerMessages[peerID].push(["Peer", date, message]);
  storage.peer_messages = JSON.stringify(peerMessages);
}
peer.on("connection", (connection) => {
  const conf = confirm(`Incoming connection from ${connection.peer}`);
  conn = connection;
  if(conf) {
    getPeerID();
    connection.on("data", getMessage);
  }
  else {
    conn.close();
    conn = null;
  }
});

peer.on("disconnected", () => {
  document.getElementById("connection").innerHTML = "Connection lost.";
});
peer.on("close", () => {
  conn = null;
  document.getElementById("connection").innerHTML = "Connection lost.";
});
