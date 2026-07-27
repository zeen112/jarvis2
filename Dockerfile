FROM node:20-slim

# 1. Izinkan pip menginstall paket secara global (Melewati aturan PEP 668)
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# 2. Install Python full, C++ compiler & kebutuhan build SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-full \
    python3-venv \
    git \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# 3. Install dan paksa recompile native modules (SQLite) dari source
RUN npm install && npm rebuild better-sqlite3 sqlite3 --build-from-source

COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
