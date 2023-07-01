import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import * as userService from "../../domain/user/service";
import { FastifyPluginAsync } from "fastify";

const prisma = new PrismaClient();

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/login",
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
      const user = await fastify.prisma.user.findUnique({
        select: {
          id: true,
          hash_password: true,
          frontend_salt: true,
          disabled: true,
        },
        where: {
          login_name: request.body.login_name,
        },
      });
      if (!user) {
        reply.code(400).send({ message: "登录名不存在" });
        return;
      }
      const userModel = new userService.User();
      userModel.hash_password = user.hash_password;
      userModel.frontend_salt = user.frontend_salt;
      const validPassword = await userService.checkPassword(
        userModel,
        request.body.password
      );
      if (!validPassword) {
        reply.code(400).send({ message: "密码错误" });
        return;
      }
      if (user.disabled) {
        reply.code(400).send({ message: "账号已停用" });
        return;
      }
      request.session.user_id = user.id;
      reply.send("登录成功");
    },
  });
};

export default router;
