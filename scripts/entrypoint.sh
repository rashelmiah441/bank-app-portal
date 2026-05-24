#!/bin/sh

# Sync database schema
npx prisma db push --skip-generate

# Start the application
node server.js
