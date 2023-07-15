import fp from "fastify-plugin";
import { fastifyFormbody } from "@fastify/formbody";

export default fp(async (fastify) => {
  fastify.register(fastifyFormbody);
});
