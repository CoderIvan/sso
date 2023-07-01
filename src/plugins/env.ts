import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import { join } from "path";

export default fp(async (fastify) => {
  const schema = {
    type: "object",
    required: ["REDIS_PATH"],
    properties: {
      REDIS_PATH: {
        type: "string",
      },
    },
  };

  const options = {
    dotenv: true,
    path: join(__dirname, `../../.env`),
    debug: true,
    schema: schema,
  };

  fastify.register(fastifyEnv, options);
});
