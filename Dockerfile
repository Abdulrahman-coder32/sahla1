# مرحلة 1: بناء الـ Angular Frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/fadahrak-frontend/ .
RUN npm install
RUN npm run build -- --configuration production

# مرحلة 2: تشغيل الـ Node.js Backend
FROM node:20
WORKDIR /app
COPY backend/ .
RUN npm install

# نسخ الـ frontend المبني إلى مكان الـ backend بيقدم منه
COPY --from=frontend-build /app/frontend/dist/fadahrak-frontend /app/fadahrak-frontend/dist/fadahrak-frontend

# البورت
EXPOSE 5000

# تشغيل
CMD ["node", "index.js"]
