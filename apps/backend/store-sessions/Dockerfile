FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm exec tsc
    
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/ ./
COPY --from=builder /usr/app/node_modules/ ./node_modules/
COPY --from=builder /usr/app/package.json ./
CMD ["dist/index.handler"]