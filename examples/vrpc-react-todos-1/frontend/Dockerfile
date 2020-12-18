FROM node:12.20.0
WORKDIR /app
RUN npm install -g serve
COPY . /app
RUN npm install --only=prod
RUN npm run build
CMD serve -s build -l 3000
