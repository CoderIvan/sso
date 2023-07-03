import * as userService from "../../domain/user/service";
import { FastifyPluginAsync } from "fastify";

const router: FastifyPluginAsync = async (fastify) => {
  const admin = await fastify.prisma.user.findUnique({
    select: {
      id: true,
    },
    where: { login_name: "admin" },
  });

  if (!admin) {
    await fastify.prisma.user.create({
      data: await userService.create("admin", "admin"),
    });
  }
};

export default router;
