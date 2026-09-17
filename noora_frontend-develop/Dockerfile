FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Set the environment variable to increase heap memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# NEXT_PUBLIC_* values are inlined at build time, so they have to be present
# here - passing them only at runtime has no effect.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_EXTERNAL_API_URL
ARG NEXT_PUBLIC_INTERNAL_API_URL
ARG NEXT_PUBLIC_CUSTOMER_LOGO
ARG NEXT_PUBLIC_CUSTOMER_NAME
ARG NEXT_PUBLIC_ENABLE_OTP_LOGIN
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_EXTERNAL_API_URL=$NEXT_PUBLIC_EXTERNAL_API_URL \
    NEXT_PUBLIC_INTERNAL_API_URL=$NEXT_PUBLIC_INTERNAL_API_URL \
    NEXT_PUBLIC_CUSTOMER_LOGO=$NEXT_PUBLIC_CUSTOMER_LOGO \
    NEXT_PUBLIC_CUSTOMER_NAME=$NEXT_PUBLIC_CUSTOMER_NAME \
    NEXT_PUBLIC_ENABLE_OTP_LOGIN=$NEXT_PUBLIC_ENABLE_OTP_LOGIN

# Dependencies are installed with npm above; build with npm too.
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --chown=nextjs:nextjs --from=builder /app/.next ./.next
COPY --chown=nextjs:nextjs --from=deps /app/node_modules ./node_modules/
COPY --chown=nextjs:nextjs --from=deps /app/package*.json ./

EXPOSE 3000

ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
