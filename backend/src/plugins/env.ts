import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import { join } from "path";

export default fp(async (fastify) => {
  const schema = {
    type: "object",
    required: ["MYSQL_URL", "REDIS_PATH"],
    properties: {
      MYSQL_URL: {
        type: "string",
      },
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
