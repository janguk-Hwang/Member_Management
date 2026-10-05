#!/bin/bash
set -e

echo "=== Building Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Copying Frontend to Backend ==="
rm -rf backend/src/main/resources/static
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/

echo "=== Building Backend ==="
cd backend
chmod +x gradlew
./gradlew build -x test
cd ..

echo "=== Build Complete ==="
