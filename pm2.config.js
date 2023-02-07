module.exports = {
  apps : [{
    name      : 'server',
    script    : 'src/server.js',
    node_args : '-r dotenv/config',
  }],
}
