FROM node:lts-alpine

WORKDIR /app

# New cacheable layer
# Copy only package.json & package-lock.json
COPY package*.json ./

# New cacheable layer
# Copy only app/package.json app/package-lock.json
# Be aware of adding the `/` trailing slash
COPY app/package*.json app/
# New cacheable layer
# This layer is only re-built if those app's package.json files are updated.
# Otherwise, it uses the cache
RUN npm run install-app --only=production

# New cacheable layer
# Same principles applied to `server`
COPY server/package*.json server/
RUN npm run install-server --only=production

# New cacheable layer
# Copy the `app` source code
COPY app/ app/
# New cacheable layer
# This is only re-built if there are changes made to the `app` folder
RUN npm run build --prefix app

# New cacheable layer
# Copy `server` source code
COPY server/ server/

USER node

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000