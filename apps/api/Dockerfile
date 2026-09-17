FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
# --filter=@linkedout/api... builds @linkedout/api and every workspace
# package it depends on (e.g. @linkedout/database), in the right order.
RUN pnpm turbo run build --filter=@linkedout/api...

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter @linkedout/database migrate && pnpm --filter @linkedout/api start"]
