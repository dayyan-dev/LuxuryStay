# Node.js base image
FROM node:20-slim

# App folder container ke andar
WORKDIR /app

# Pehle package.json copy karo (Docker caching ke liye behtar)
COPY package*.json ./

# Sirf production dependencies install karo
RUN npm install --production

# Baaki poora backend code copy karo
COPY . .

# Backend jis port par chalta hai
EXPOSE 5001

# App start karne ka command
CMD ["node", "Index.js"]