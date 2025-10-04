# Use Node.js LTS version as the base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install backend dependencies first
COPY package*.json ./
RUN npm install

# Copy frontend package.json
COPY front-end/package*.json ./front-end/
# Install frontend dependencies
WORKDIR /usr/src/app/front-end
RUN npm install

# Copy all source code
WORKDIR /usr/src/app
COPY . .

# Build the frontend application
WORKDIR /usr/src/app/front-end
RUN npm run build

# Verify the build directory exists and show its contents (for debugging)
RUN ls -la /usr/src/app/front-end/dist

# Move the built frontend to the location expected by the Express server
RUN mkdir -p /usr/src/app/dist
RUN cp -R /usr/src/app/front-end/dist/public /usr/src/app/dist/

# Return to the main directory
WORKDIR /usr/src/app

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]