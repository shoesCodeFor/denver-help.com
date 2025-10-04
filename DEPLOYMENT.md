# Deploying to DigitalOcean App Platform

This guide covers how to deploy the Indeed Parser API to DigitalOcean App Platform.

## Prerequisites

- A DigitalOcean account
- Git repository with your application code
- DigitalOcean CLI (doctl) installed (optional, for CI/CD)
- USAJobs API key and other required API keys

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository includes these files:
- `Dockerfile` - Defines how to build your application container
- `.dockerignore` - Excludes unnecessary files from the container
- `app.yaml` - App Platform configuration file

### 2. Create a New App in DigitalOcean App Platform

1. Log in to your DigitalOcean account
2. Navigate to the App Platform section
3. Click "Create App"
4. Select your repository source (GitHub, GitLab, or direct upload)
5. Select the repository containing your application
6. Select the branch to deploy (usually `main` or `master`)

### 3. Configure Your App

#### Environment Variables

The app requires these environment variables:
- `US_JOBS_API_KEY` - USAJobs API key
- `FINDWORK_API_KEY` - FindWork API key (if used)
- `PORT` - Port to run the application on (default: 3000)

To add these in the DigitalOcean dashboard:
1. Go to your app's settings
2. Click "Environment Variables"
3. Add each required variable
4. Mark sensitive variables like API keys as "Encrypted"

#### Resources and Scaling

1. Select an appropriate plan based on your needs (Basic, Pro, etc.)
2. Configure resources (CPU, RAM) 
3. Set up auto-scaling if needed (in app.yaml or via dashboard)

#### Health Checks

The application has a `/health` endpoint configured in app.yaml for App Platform to monitor:
- Initial delay: 10 seconds
- Check interval: 30 seconds
- Timeout: 5 seconds

### 4. Deploy Your Application

1. Click "Launch App" in the DigitalOcean dashboard
2. DigitalOcean will build and deploy your application
3. You'll receive a default URL (e.g., `https://indeed-parser-api-abcd1234.ondigitalocean.app`)

### 5. Verify Deployment

1. Access the application URL
2. Check the `/health` endpoint to verify it's running
3. Test the API endpoints:
   - `/api/jobs?location=Denver,%20CO`
   - `/api/usajobs?location=Denver,%20CO`
   - Other endpoints as needed

### 6. Monitoring and Logs

1. In the App Platform dashboard, go to your app
2. Click on "Insights" to view performance metrics
3. Click on "Logs" to view application logs
4. Set up alerts for important metrics (optional)

### 7. CI/CD Pipeline (Optional)

For continuous deployment:
1. Configure your CI/CD platform (GitHub Actions, GitLab CI, etc.)
2. Use the DigitalOcean App Platform API or CLI (doctl) to trigger deployments
3. Example GitHub Actions workflow:

```yaml
name: Deploy to DigitalOcean App Platform

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - name: Deploy app
        run: doctl apps update ${{ secrets.APP_ID }} --spec app.yaml
```

### 8. Custom Domains (Optional)

To use a custom domain:
1. Go to your app's settings
2. Click "Domains"
3. Add your domain
4. Update DNS records at your domain registrar
5. Wait for SSL certificate provisioning

### 9. Troubleshooting

Common issues and solutions:

- **Build failures**: Check Dockerfile syntax and build logs
- **Startup failures**: Verify environment variables are set correctly
- **Health check failures**: Ensure the `/health` endpoint is working correctly
- **API errors**: Check logs for specific error messages
- **Performance issues**: Consider scaling up resources or enabling auto-scaling

## Additional Resources

- [DigitalOcean App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Node.js on App Platform](https://docs.digitalocean.com/products/app-platform/languages-frameworks/nodejs/)
- [Continuous Deployment with App Platform](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-github/)