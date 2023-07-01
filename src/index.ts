import { join } from "path";
import AutoLoad from "@fastify/autoload";
import Fastify, { FastifyServerOptions } from "fastify";
const isDev = process.env.NODE_ENV === "development";

const fastifyHttpOptions: FastifyServerOptions = {
  logger: true,
};
if (isDev) {
  fastifyHttpOptions.logger = {
    transport: {
      target: "pino-pretty",
      options: {
        singleLine: true,
      },
    },
  };
}
const fastify = Fastify(fastifyHttpOptions);

fastify.register(AutoLoad, {
  dir: join(__dirname, "plugins"),
});
if (isDev) {
  fastify.register(AutoLoad, {
    dir: join(__dirname, "dev/plugins"),
  });
}

fastify.after(() => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
  });
  if (isDev) {
    fastify.register(AutoLoad, {
      dir: join(__dirname, "dev/routes"),
    });
  }
});

(async function run() {
  await fastify.ready();

  const address = await fastify.listen({
    port: 3000,
    host: "0.0.0.0",
  });
  if (isDev) {
    fastify.log.info(`Swagger UI listening at ${address}/documentation`);
  }
})();
