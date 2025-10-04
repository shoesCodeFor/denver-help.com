# Use Node.js LTS version as the base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# Bundle app source
COPY . .

# Install dependencies in the root and indeed-parser directories
RUN npm install



# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]