import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyPluginAsync } from "fastify";

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/profile",
    schema: {
      tags: ["user"],
      response: {
        200: z.object({
          login_name: z.string(),
        }),
      },
    },
    async handler(request, reply) {
      const user = await fastify.prisma.user.findUniqueOrThrow({
        select: {
          login_name: true,
        },
        where: {
          id: request.session.user_id,
        },
      });
      reply.send({ login_name: user.login_name });
    },
  });
};

export default router;
