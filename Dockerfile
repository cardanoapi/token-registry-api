# Base image
FROM node:20-alpine as base

# Install Git
RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Development stage for building the app
FROM base as build
WORKDIR /app

# Copy all application files
COPY . .

# Install all dependencies (both production and dev dependencies)
RUN yarn install --frozen-lockfile

# Build the application (ensure you have a 'build' script in package.json)
RUN yarn build

RUN node dist/forceClone.js

# Production stage
FROM node:20-alpine as prod

# Install Git in production stage as well
RUN apk add --no-cache git

WORKDIR /app

# Install production dependencies
COPY --from=build /app/package.json /app/yarn.lock /app/
RUN yarn install --production --frozen-lockfile

# Copy built application files
COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/offchain-metadata/ /app/offchain-metadata/

# Expose the port the app will run on
EXPOSE 8080

# Run the application
CMD ["node", "dist/index.js"]
