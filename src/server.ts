import express, { Express, Request, Response } from "express";
//const expressPeerServer = require('peer').ExpressPeerServer;
import { ExpressPeerServer as expressPeerServer } from "peer";

const app: Express = express();

const clientConfig = {
  host: process.env.HOST,
  port: process.env.PEER_PORT,
  path: process.env.PEER_PATH,
//  secure: true,
}

app.use(express.static("dist"));

app.get("/", (req: Request, res: Response) => res.sendFile("/index.html", { root: "./dist" }));

app.get("/config", (req: Request, res: Response) => res.send(clientConfig));

const server = app.listen(process.env.PORT);

const serverConfig = {
  port: Number(process.env.PEER_PORT),
  path: process.env.PEER_PATH || "/peer",
  proxied: true,
}
const peerServer = expressPeerServer(server, serverConfig);

app.use("/", peerServer);
