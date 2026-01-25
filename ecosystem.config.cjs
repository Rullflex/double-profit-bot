module.exports = {
  apps: [
    {
      name: 'double-profit-bot',
      script: 'dist/main.js',
      node_args: '-r dotenv-flow/config',
    },
  ],
}
