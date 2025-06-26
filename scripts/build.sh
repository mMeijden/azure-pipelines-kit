echo "Building application..."
npm install
npm run build
npm test

echo "Creating distribution package..."
tar -czf dist.tar.gz dist/

echo "Build process completed!"
