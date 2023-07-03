import { join } from "path";
import AutoLoad from "@fastify/autoload";
import Fastify, { FastifyServerOptions } from "fastify";
import zodSwagger from "./zod-swagger";

const openPrettyLog = process.env.PRETTY_LOG === "1";
const openSwaggerUI = process.env.SWAGGER_UI === "1";

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
});

(async function run() {
  await fastify.ready();

  const { ADDRESS = "localhost", PORT = "3000" } = process.env;

  const address = await fastify.listen({
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
