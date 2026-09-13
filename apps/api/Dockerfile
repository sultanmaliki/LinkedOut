FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter @linkedout/database migrate && pnpm --filter @linkedout/api dev"]
