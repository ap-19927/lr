import express, { Express, Request, Response } from "express";
import { ExpressPeerServer as expressPeerServer } from "peer";

const app: Express = express();

const clientConfig = {
  host: process.env.HOST,
  key: process.env.KEY,
  port: process.env.PEER_PORT,
  path: process.env.PEER_PATH,
  secure: true,
  config: {
    "iceServers": [
      {
        urls: "stun:relay.metered.ca:80",
      },
    ],
  },
}

app.use(express.static("dist"));

app.get("/", (req: Request, res: Response) => res.sendFile("/index.html", { root: "./dist" }));

app.post("/config", (req: Request, res: Response) => res.send(clientConfig));

const server = app.listen(process.env.PORT);

const serverConfig = {
  key: process.env.KEY,
  port: Number(process.env.PEER_PORT),
  path: process.env.PEER_PATH || "/peer",
  proxied: true,
}
const peerServer = expressPeerServer(server, serverConfig);

app.use("/", peerServer);
