import axios from "axios";

const storage = window.localStorage;

const ID = storage.peer ? storage.peer : [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
if(!storage.peer) storage.setItem("peer", ID);
if(!storage.peer_messages) storage.setItem("peer_messages", `{"0":"0"}`);

const peerMessages = JSON.parse(storage.peer_messages);
const connectionBox = document.getElementById("connection");
const messagesBox = document.getElementById("messages");
const otherPeerID = document.getElementById("otherPeerID");

const selectPeerID = otherPeerID.options;
for(const id in peerMessages)
  selectPeerID.add(new Option(id));

const messagesHistory = () => {
  otherMessages.innerHTML = "";
  selectedID.innerHTML = "";
  const id = otherPeerID.value;
  if(id !== "0") {
    selectedID.innerHTML = id;
    peerMessages[id].forEach( (a) => {
      otherMessages.innerHTML = `<br> ${a[0]}: ${a[1]} ${a[2]} ${otherMessages.innerHTML}`;
    });
  }
}
otherPeerID.onchange = messagesHistory;

let conn = null;

const data = axios({
    method: "post",
    url: "/config",
    responseType: "json",
  })
  .then(res => {return res.data;})
  .catch(e => {console.log(e.message);});
const peer = new Peer(ID, await data);

const messageDetails = (message, peerID, person) => {
  const date = new Date();
  messagesBox.innerHTML = `<br> ${person}: ${date} ${message} ${messagesBox.innerHTML}`;
  peerMessages[peerID].push([person, date, message]);
}
const getMessage = (message) => {
  messageDetails(message, conn.peer, "Peer");
}
const oldMessages = (peerID) => {
  connectionBox.innerHTML = `Connected to ${peerID}.`
  messagesBox.innerHTML = "";
  if(!peerMessages[peerID])
    peerMessages[peerID] = [];
  if(peerMessages[peerID].length !== 0)
    peerMessages[peerID].forEach( (a) => {
      messagesBox.innerHTML = `<br> ${a[0]}: ${a[1]} ${a[2]} ${messagesBox.innerHTML}`;
    });
}
const connectionDetails = (connection, peerID) => {
  if(conn)
    conn.close();
  conn = connection;
  connection.on("open", () => {
    oldMessages(peerID);
  });
  connection.on("data", getMessage);
  connection.on("close", () => {
    connectionBox.innerHTML = "Connection closed.";
    storage.peer_messages = JSON.stringify(peerMessages);
  });
}
const sendPeerID = () => {
  const peerID = document.getElementById("peerID").value;
  if(peerID !== "") {
    const conf = confirm(`Connect to ${peerID}?`);
    if(conf)
      connectionDetails(peer.connect(peerID), peerID);
  }
}
const getPeerID = (connection) => {
  const conf = confirm(`Incoming connection from ${connection.peer}`);
  if(conf)
    connectionDetails(connection, connection.peer);
  else
    connection.close();
}

const sendMessage = () => {
  if(conn && conn._open) {
    const message = document.getElementById("message").value;
    conn.send(message);
    messageDetails(message, conn.peer, "Self");
  }
}

peer.on("open", (id) => {
  document.getElementById("selfID").innerHTML = `Your ID is ${id}.`;
});

document.getElementById("connectButton").addEventListener("click", sendPeerID);

peer.on("connection", getPeerID);

document.getElementById("messageButton").addEventListener("click", sendMessage);

peer.on("disconnected", () => {
  connectionBox.innerHTML = "Connection disconnected.";
  storage.peer_messages = JSON.stringify(peerMessages);
});
