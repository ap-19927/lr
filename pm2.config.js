module.exports = {
  apps : [{
    name      : "server",
    script    : "./dist/server.js",
    node_args : "-r dotenv/config",
  }],
};
