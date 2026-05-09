# Build and run the Vite SPA on Railway (Linux — avoids Railpack/npm ci quirks on their builder).
# Set VITE_API_URL in Railway and enable it for Docker builds if you need a non-default API URL.

FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Railway (and others) may set NODE_ENV=production during image build; that makes `npm ci`
# skip devDependencies, so Vite would be missing. Force dev deps for the compile stage.
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY scripts/serve.cjs ./scripts/serve.cjs

CMD ["node", "scripts/serve.cjs"]
