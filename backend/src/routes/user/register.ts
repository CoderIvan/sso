import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { FastifyPluginAsync } from "fastify";
import * as userService from "../../domain/user/service";

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/register",
    schema: {
      tags: ["user"],
      body: z.object({
        login_name: z.string().min(4).max(12),
        password: z.string().min(4).max(12),
      }),
      response: {
        200: z.string(),
        400: z.object({
          message: z.string(),
        }),
      },
    },
    async handler(request, reply) {
      const existUser = await fastify.prisma.user.findUnique({
        select: {
          id: true,
        },
        where: {
          login_name: request.body.login_name,
        },
      });
      if (existUser) {
        reply.code(400).send({ message: "用户名已存在" });
        return;
      }

      await fastify.prisma.user.create({
        data: await userService.create(
          request.body.login_name,
          request.body.password
        ),
      });

      reply.send("注册成功");
    },
  });
};

export default router;
