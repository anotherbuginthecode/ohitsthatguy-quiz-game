FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY src ./src
RUN ./node_modules/.bin/esbuild src/index.ts \
    --bundle --minify --platform=node --target=es2020 \
    --outfile=dist/index.js

FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/index.js ./dist/index.js
CMD ["dist/index.handler"]
