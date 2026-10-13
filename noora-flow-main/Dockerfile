FROM node:20-slim AS builder
# RUN apk add g++ make python3
# RUN apk add git fontconfig curl --no-cache


ENV APPDIR=/app
ENV NODE_ENV=build

##
# Create the working directory and change its ownership to "node."
RUN cd /
RUN mkdir $APPDIR
RUN chown -R node:node $APPDIR

WORKDIR $APPDIR

##
# Set the user that is to be used with this image. Using another user
# but root helps with better security of our image. The "node" user
# comes by default with node images.
USER node

##
# Separate copying package*.json from the rest of codebase to avoid
# running `npm ci` when no new packages are installed. This is to
# leverage Docker's cache system.
COPY --chown=node:node package*.json ./

ENV PUPPETEER_SKIP_DOWNLOAD true

##
# Do a clean-install of devDependencies.
RUN npm ci
##
# Now, copy the whole codebase.
COPY --chown=node:node assets ./assets/
COPY --chown=node:node src ./src/

##
# Also, add the typescript build configuration.
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node nest-cli.json ./

##
# Build the application.
RUN npm run build \
    && npm prune --production


FROM node:20-slim AS production

ENV APPDIR=/app
ENV NODE_ENV=production

##
# Create the working directory and change its ownership to "node."
RUN mkdir $APPDIR
RUN chown -R node:node $APPDIR

WORKDIR $APPDIR

##
# Bring the build from the develpment phase.
COPY --chown=node:node --from=builder ${APPDIR}/dist ./dist/
COPY --chown=node:node --from=builder ${APPDIR}/assets ./assets/
COPY --chown=node:node --from=builder ${APPDIR}/node_modules ./node_modules/

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

# Use Debian's own chromium package instead of Google's apt repo - the
# google-chrome-stable repo is only reachable over HTTPS on this host (plain
# HTTP to dl.google.com times out), which broke apt-get update against it.
RUN apt-get -o Acquire::Retries=3 update     && apt-get -o Acquire::Retries=3 install -y --no-install-recommends chromium fonts-freefont-ttf fonts-noto-core ca-certificates     && ln -s /usr/bin/chromium /usr/bin/google-chrome-stable     && rm -rf /var/lib/apt/lists/*

RUN which google-chrome-stable || true

##
# Do a clean-install of dependencies.
# RUN npm ci --only=production

##
# Expose port 4000.
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.APP_PORT||4000)+'/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

##
# Execute the application in production.
CMD ["node", "dist/main"]
