# Multi-stage Dockerfile for Digital Ocean Apps Platform
# This file helps DO detect the monorepo structure

# Stage 1: Backend (FastAPI)
FROM python:3.11-slim as backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Stage 2: Frontend (React + Vite)
FROM node:18-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm ci
COPY frontend/ .
RUN npm run build

# Final stage: Nginx serving frontend + backend proxy
FROM nginx:alpine
COPY --from=frontend /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
