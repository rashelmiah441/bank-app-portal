module.exports = {
  apps: [
    {
      name: 'bank-portal',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
