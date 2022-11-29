FROM node:alpine

WORKDIR /frontend

COPY package.json ./

COPY package-lock.json ./

RUN npm i

COPY ./ ./
# CMD ["npm", "run", "build"]

EXPOSE 80

ENV DANGEROUSLY_DISABLE_HOST_CHECK = true

ENV PORT=80

CMD ["npm", "start"]
