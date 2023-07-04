import fp from "fastify-plugin";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import Redis from "ioredis";
import RedisStore from "connect-redis";

export default fp(async (fastify) => {
  fastify.register(fastifyCookie);

  const client = new Redis(fastify.config.REDIS_PATH, {
    keyPrefix: "sso:",
  });
  const store = new RedisStore({
    client: client,
  });
  fastify.register(fastifySession, {
    secret: "a secret with minimum length of 32 characters",
    cookie: {
      secure: false, // 设置为true时，只在HTTPS上工作
    },
    store,
  });
});

declare module "fastify" {
  interface Session {
    user_id: number;
  }
  interface FastifyInstance {
    config: {
      REDIS_PATH: string;
    };
  }
}
