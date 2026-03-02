// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "assessor-api",
      script: "./dist/server.js",
      instances: 1, // Change to "max" if you want to run in cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};