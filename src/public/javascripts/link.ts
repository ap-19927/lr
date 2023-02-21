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
const peer = new Peer(`link-${ID}`, await data);
peer.on("open", (id) => {
  document.getElementById("selfID").innerHTML = `Your ID is ${id.slice(5)}.`;
});

let conn = null;
const sendSelfID = () => {
  const selfID = document.getElementById("allowConnectionsFrom").value;
  conn = peer.connect(`link-${selfID}`);
}
document.getElementById("allowConnectionsFromButton").addEventListener("click", sendSelfID);

peer.on("connection", (connection) => {
  const newID = connection.peer.slice(5);
  const conf = confirm(`Change ID to ${newID}`);
  if(conf) {
    conn = connection;
    storage.setItem("peer", newID);
    document.getElementById("selfID").innerHTML = `Your ID is now ${newID}. Please close this window.`;
    conn.close();
    conn = null;
  }
  else {
    connection.close();
  }
});
