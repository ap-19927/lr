require("dotenv").config();
const express = require("express");
const expressPeerServer = require('peer').ExpressPeerServer;

const app = express();

const clientConfig = {
  host: process.env.HOST,
  port: process.env.PEER_PORT,
  path: process.env.PEER_PATH,
//  secure: true,
}

app.use(express.static("dist", { root: "." }));

app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: "../dist" })
});

app.get("/config", (req, res) => res.send(clientConfig));

const server = app.listen(process.env.PORT);

const serverConfig = {
  port: process.env.PEER_PORT,
  path: process.env.PEER_PATH,
  proxied: true,
}
const peerServer = expressPeerServer(server, serverConfig);

app.use("/", peerServer);
