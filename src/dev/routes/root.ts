import { ZodTypeProvider } from "fastify-type-provider-zod";
import fp from "fastify-plugin";
import { z } from "zod";

export default fp(async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["dev"],
      response: {
        200: z.string(),
      },
    },
    handler(request, reply) {
      reply.send("Hello World");
    },
  });
});
