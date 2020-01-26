FROM node:11-alpine
COPY utils.js /utils.js
COPY index.js /index.js
COPY gen.js /gen.js
COPY entrypoint.sh /entrypoint.sh
COPY package.json /package.json
RUN npm i 
RUN chmod +x /entrypoint.sh
ARG GITHUB_KEY=GITHUB_KEY
ENV GITHUB_KEY=${GITHUB_KEY}
RUN node /gen.js
RUN cat public.pem
RUN cat private.pem
ENTRYPOINT ["/entrypoint.sh"]