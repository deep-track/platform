#!/bin/bash
set -e

echo "==> Installing dependencies..."
npm install

echo "==> Generating Prisma Client..."
npx prisma generate

echo "==> Pushing database schema (accepting data loss)..."
npx prisma db push --accept-data-loss

echo "==> Building Next.js application..."
npm run build

echo "==> Build complete!"
