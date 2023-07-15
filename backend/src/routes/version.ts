import * as fs from "fs/promises";
import { join } from "path";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { z } from "zod";

export default fp(async (fastify) => {
  const file = await fs.readFile(join(__dirname, "../../package.json"), "utf8");
  const packagejson = JSON.parse(file);
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/version",
    schema: {
      response: {
        200: z.object({
          version: z.string(),
        }),
      },
    },
    handler(request, reply) {
      reply.send({ version: packagejson.version });
    },
  });
});
