# ── Stage 1: Build TypeScript ──────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc --noEmitOnError false || true

# ── Stage 2: Production image ──────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Install Python + pip + build tools needed by numpy/statsmodels
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a venv
COPY requirements.txt .
RUN python3 -m venv /app/venv \
    && /app/venv/bin/pip install --upgrade pip \
    && /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy compiled JS and Python scripts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Python scripts (not compiled by tsc, copied directly)
COPY src/python-script ./dist/python-script

# Make venv python3 available on PATH
ENV PATH="/app/venv/bin:$PATH"
ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "dist/index.js"]
