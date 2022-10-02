FROM node:lts-alpine

WORKDIR /app

# New cacheable layer
# Copy only package.json & package-lock.json
COPY package*.json ./

# New cacheable layer
# Copy only app/package.json app/package-lock.json
# Be aware of adding the `/` trailing slash
COPY client/package*.json app/
# New cacheable layer
# This layer is only re-built if those client's package.json files are updated.
# Otherwise, it uses the cache
RUN npm run install-app --only=production

# New cacheable layer
# Same principles applied to `server`
COPY server/package*.json server/
RUN npm run install-server --only=production

# New cacheable layer
# Copy the `client` source code
COPY client/ client/
# New cacheable layer
# This is only re-built if there are changes made to the `client` folder
RUN npm run build --prefix client

# New cacheable layer
# Copy `server` source code
COPY server/ server/

USER node

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000