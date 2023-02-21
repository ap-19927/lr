import axios from "axios";
const data = axios({
    method: "post",
    url: "/config",
    responseType: "json",
  })
  .then(res => {return res.data;})
  .catch(e => {console.log(e.message);});

const storage = window.localStorage;

const ID = storage.peer;
const peer = new Peer(ID, await data);
console.log(peer);
peer.on("open", (id) => {
  console.log("h, ",id);
  document.getElementById("selfID").innerHTML = `Your ID is ${id}.`;
});

let conn = null;
const sendSelfID = () => {
  const selfID = document.getElementById("allowConnectionsFrom").value;
  conn = peer.connect(selfID);
}
document.getElementById("allowConnectionsFromButton").addEventListener("click", sendSelfID);

peer.on("connection", (connection) => {
  const conf = confirm(`Change ID to ${connection.peer}`);
  conn = connection;
  if(conf) {
    storage.setItem(":peer", connection.peer);
    conn.close();
    conn = null;
  }
  else {
    conn.close();
    conn = null;
  }
});
