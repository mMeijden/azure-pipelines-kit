#!/bin/bash
echo "Starting deployment process..."
echo "Current working directory: $(pwd)"
echo "Available space: $(df -h .)"

# Deploy application
echo "Deploying application..."
kubectl apply -f deployment.yaml
kubectl rollout status deployment/my-app

echo "Deployment completed successfully!"
