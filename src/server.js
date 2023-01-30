require("dotenv").config();
const path = require("path");
const express = require("express");
const expressPeerServer = require('peer').ExpressPeerServer;

const app = express();

const config = {
  host: process.env.HOST,
  port: process.env.PORT,
  path: process.env.PEER_PATH,
  key: process.env.KEY,
  proxied: true,
}

app.use(express.static("dist", { root: "." }));

app.get("/", (req, res) => {
  res.sendFile("/index.html", { root: "../dist" })
});

app.get("/config", (req, res) => res.send(config));

const server = app.listen(process.env.PORT);

const peerServer = expressPeerServer(server, config);

app.use("/", peerServer);
