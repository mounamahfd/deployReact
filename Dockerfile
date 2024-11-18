# Step 1: Use an official Node.js image to build the app
FROM node:20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app’s code to the container
COPY . .

# Build the app
RUN npm run build

# Step 2: Use an Nginx image to serve the app
FROM nginx:alpine

# Copy the build files from the previous stage to the Nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
