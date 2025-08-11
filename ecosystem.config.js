export default {
  apps: [
    {
      name: "internal-bot",
      script: "dist/bots/internal/index.js",
      node_args: "-r dotenv-flow/config",
    },
    {
      name: "external-bot",
      script: "dist/bots/external/index.js",
      node_args: "-r dotenv-flow/config",
    }
  ]
}