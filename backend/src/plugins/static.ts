import fp from "fastify-plugin";
import { fastifyStatic } from "@fastify/static";
import * as path from "path";

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../../public"),
  });
});
