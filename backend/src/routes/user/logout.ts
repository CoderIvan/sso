import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyPluginAsync } from "fastify";

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/logout",
    schema: {
      tags: ["user"],
      response: {
        200: z.string(),
      },
    },
    async handler(request, reply) {
      await request.session.destroy();
      reply.send("登出成功");
    },
  });
};

export default router;
