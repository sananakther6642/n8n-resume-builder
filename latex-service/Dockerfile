FROM node:20-alpine

RUN apk add --no-cache \
    texlive \
    texmf-dist-latexextra \
    texmf-dist-fontsrecommended \
    perl

RUN pdflatex --version

WORKDIR /app
COPY server.js .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
