import { join } from "path";
import AutoLoad from "@fastify/autoload";
import Fastify, { FastifyServerOptions } from "fastify";
import zodSwagger from "./zod-swagger";

const {
  ADDRESS = "localhost",
  PORT = "3000",
  PRETTY_LOG,
  SWAGGER_UI,
} = process.env;

const openPrettyLog = PRETTY_LOG === "1";
const openSwaggerUI = SWAGGER_UI === "1";

const fastifyHttpOptions: FastifyServerOptions = {
  logger: true,
};
if (openPrettyLog) {
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

if (openSwaggerUI) {
  fastify.register(zodSwagger);
}

fastify.after(() => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "seed"),
  });
});

(async function run() {
  await fastify.ready();

  await fastify.listen({
    host: ADDRESS,
    port: parseInt(PORT, 10),
    listenTextResolver: (address) => {
      let originMsg = `Server listening at  ${address}`;
      if (openSwaggerUI) {
        fastify.log.info(originMsg);
        return `Swagger UI listening at ${address}/documentation`;
      } else {
        return originMsg;
      }
    },
  });
})();
