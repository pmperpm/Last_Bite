FROM node:20-alpine

WORKDIR /app

# Copy source files
COPY . .

RUN npm install
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]