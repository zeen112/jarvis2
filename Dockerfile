# 1. Gunakan Node.js v20 (Sesuai kebutuhan minimum 9Router & Hermes)
FROM node:20-slim

# 2. Install Python 3.11 & Pip yang diwajibkan oleh Hermes Agent
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    && rm -rf /var/lib/apt/lists/*

# 3. Buat direktori kerja
WORKDIR /usr/src/app

# 4. Copy package.json dan install dependencies
COPY package*.json ./

RUN npm install

# 5. Copy seluruh sisa kodingan project
COPY . .

# 6. Expose Port 3000 untuk Express Health Check
EXPOSE 3000

# 7. Jalankan aplikasi
CMD [ "node", "app.js" ]
