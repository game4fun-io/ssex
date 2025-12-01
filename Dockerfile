# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

# Install dependencies (force dev deps for build tools like vite)
RUN npm install --include=dev

# Copy source code
COPY . .

# Build client
RUN npm run build --workspace=@ssex/client

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Copy server dependencies (we could prune devDeps but for simplicity copying all for now, or reinstall prod only)
COPY package.json ./
COPY packages/server/package.json ./packages/server/

# Install ONLY production dependencies for server
# Note: We need to be careful with workspaces. 
# Simpler approach: Copy everything from build stage, then prune.
COPY --from=build /app /app

# Prune dev dependencies (optional, skipping for stability in this POC)
# RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5002

# Expose port
EXPOSE 5002

# Start server
CMD ["npm", "run", "start", "--workspace=@ssex/server"]
