import * as clientService from "../domain/client/service";
import { FastifyPluginAsync } from "fastify";

const plugin: FastifyPluginAsync = async (fastify) => {
  const admin = await fastify.prisma.client.findUnique({
    select: {
      id: true,
    },
    where: { name: "admin" },
  });

  if (!admin) {
    await fastify.prisma.client.create({
      data: clientService.create(
        "admin",
        "http://localhost:9000/callback",
        "oauth-client-id-admin",
        "oauth-client-secret-admin"
      ),
    });
  }

  const tool = await fastify.prisma.client.findUnique({
    select: {
      id: true,
    },
    where: { name: "tool" },
  });
  if (!tool) {
    await fastify.prisma.client.create({
      data: clientService.create(
        "tool",
        "http://localhost:9000/callback",
        "oauth-client-id-tool",
        "oauth-client-secret-tool",
      ),
    });
  }
};

export default plugin;
