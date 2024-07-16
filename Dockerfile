# Use official node runtime as a parent image
FROM node:12-alpine
# create a node env argument
ARG NODE_ENV=development
# Define environment variables
ENV NODE_ENV=${NODE_ENV}
# Create app directory
RUN mkdir -p /usr/src/app
# Set the working directory to /usr/src/app
WORKDIR /usr/src/app
# Copy package file
COPY package.json .
# Install the dependent packages
RUN npm install
# Copy the current directory files & folders into the container
COPY . .
# Expose 3001 port available outside the container
EXPOSE 3001
# Set volume to the work directory
# Run the app when the container launch
CMD ["npm", "start"]
