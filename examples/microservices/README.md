# Microservices Examples

This folder contains examples for microservices deployment pipelines.

## Examples

### kubernetes-deployment.ts

A comprehensive microservices pipeline demonstrating:

- **Multi-Service Builds**: Independent builds for User, Order, and Payment services
- **Docker Image Management**: Building and pushing container images
- **Environment-Specific Deployments**: Using `ForEnvironments()` for staging/production
- **Integration Testing**: End-to-end testing across services
- **Blue-Green Deployment**: Production deployment strategy with rollback
- **Advanced Error Handling**: Failure detection and automatic rollback

**Template Expressions Used:**

- `WhenVar("deployUserService", "true", buildStep)` - Service-specific builds
- `WhenTesting(testStep)` - Conditional testing
- `ForEnvironments("staging", deployStep)` - Environment-specific deployment
- `WhenDeploying("production", productionStep)` - Production deployment logic
- `OnSuccess(job, successStep)` - Success-based actions
- `OnFailure(job, rollbackStep)` - Automatic failure handling
- `Always(cleanupStep)` - Guaranteed cleanup

**YAML Output:** `kubernetes-deployment.yml` - Ready to use in Azure DevOps

This example is perfect for:

- Kubernetes-based microservices
- Docker containerized applications
- Service mesh architectures (Istio, Linkerd)
- Event-driven architectures
- Multi-language service ecosystems

## Getting Started

1. **Copy the example:**

   ```bash
   cp examples/microservices/kubernetes-deployment.ts my-microservices-pipeline.ts
   ```

2. **Customize variables:**

   ```typescript
   variables: {
     dockerRegistry: "myregistry.azurecr.io",    // Your container registry
     kubernetesNamespace: "production",          // Target namespace
     environment: "staging",                     // Current environment
     deployUserService: "true",                  // Enable/disable services
     deployOrderService: "true",
     deployPaymentService: "true",
     runIntegrationTests: "true"                 // Enable/disable testing
   }
   ```

3. **Update service configuration:**

   ```typescript
   // Add or remove services as needed
   const services = ["user-service", "order-service", "payment-service"];

   services.forEach((service) => {
   	buildStage.addJob(createServiceBuildJob(service));
   });
   ```

4. **Customize deployment strategy:**

   ```typescript
   // Blue-green deployment
   new BashStep({
   	displayName: "Blue-Green Deployment",
   	bash: `
       kubectl apply -f k8s/production/green/ -n production
       kubectl wait --for=condition=available deployment --all -n production-green
       kubectl patch service frontend -p '{"spec":{"selector":{"version":"green"}}}'
     `
   });
   ```

5. **Generate YAML:**
   ```bash
   npx ts-node cli/index.ts my-microservices-pipeline.ts --output azure-pipelines.yml
   ```

## Architecture Patterns

### Service Discovery Integration

```typescript
// Register services with service discovery
OnSuccess(
	"DeployToStaging",
	new BashStep({
		displayName: "Register Services",
		bash: `
      consul services register user-service.json
      consul services register order-service.json
      consul services register payment-service.json
    `
	})
);
```

### Database Migration Coordination

```typescript
// Run database migrations before deployment
If(
	new Eq(variables.get("runMigrations"), "true"),
	new BashStep({
		displayName: "Database Migrations",
		bash: `
      kubectl apply -f k8s/migrations/user-db-migration.yaml
      kubectl wait --for=condition=complete job/user-db-migration --timeout=300s
    `
	})
);
```

### Circuit Breaker Testing

```typescript
// Test circuit breakers and resilience
WhenTesting(
	new BashStep({
		displayName: "Resilience Testing",
		bash: `
      echo "Testing circuit breakers..."
      npm run test:chaos
      npm run test:resilience
    `
	})
);
```

## Deployment Strategies

### Rolling Deployment

```typescript
ForEnvironments(
	"staging",
	new BashStep({
		displayName: "Rolling Deployment",
		bash: `
      kubectl set image deployment/user-service user-service=$(dockerRegistry)/user-service:$(Build.BuildId)
      kubectl rollout status deployment/user-service --timeout=300s
    `
	})
);
```

### Canary Deployment

```typescript
If(
	new Eq(variables.get("deploymentStrategy"), "canary"),
	new BashStep({
		displayName: "Canary Deployment",
		bash: `
      # Deploy 10% canary
      kubectl apply -f k8s/canary/10-percent.yaml
      sleep 300  # Monitor for 5 minutes
      # If successful, promote to 100%
      kubectl apply -f k8s/production/100-percent.yaml
    `
	})
);
```

### Feature Flag Integration

```typescript
// Deploy with feature flags
new BashStep({
	displayName: "Deploy with Feature Flags",
	bash: `
    kubectl set env deployment/user-service FEATURE_NEW_API=false
    kubectl set env deployment/order-service FEATURE_ASYNC_PROCESSING=true
  `
});
```

## Monitoring and Observability

### Health Check Integration

```typescript
OnSuccess(
	"DeployToProduction",
	new BashStep({
		displayName: "Health Check Verification",
		bash: `
      curl -f https://api.myapp.com/health/user-service
      curl -f https://api.myapp.com/health/order-service
      curl -f https://api.myapp.com/health/payment-service
    `
	})
);
```

### Metrics and Alerting

```typescript
Always(
	new BashStep({
		displayName: "Update Monitoring",
		bash: `
      # Update Prometheus targets
      kubectl apply -f monitoring/service-monitors.yaml
      # Update Grafana dashboards
      kubectl apply -f monitoring/grafana-dashboards.yaml
    `
	})
);
```

## Customization Tips

- **Add more services**: Scale the pattern for additional microservices
- **Service mesh integration**: Add Istio/Linkerd configuration
- **Security scanning**: Include container security scanning
- **Performance testing**: Add load testing for service interactions
- **Compliance**: Add compliance checks and audit logging
- **Multi-region**: Extend for multi-region deployments
