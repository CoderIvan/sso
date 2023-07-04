import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import codes from "./codes";
import fp from "fastify-plugin";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

const privateKey = fs.readFileSync(
  path.join(__dirname, "../../../.private.key")
);

export default fp(async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/token",
    schema: {
      tags: ["oauth2.0"],
      body: z.object({
        code: z.string(),
      }),
      response: {
        200: z.object({
          token_type: z.string(),
          id_token: z.string(),
        }),
        400: z.object({
          message: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const code = await codes.getAndDelete(req.body.code);
      if (!code) {
        reply.code(400).send({ message: "无效Code" });
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const ipayload = {
        iss: "http://localhost:9001/",
        sub: code.id,
        aud: "client.client_id",
        iat: now,
        exp: now + 5 * 60,
        user: code,
      };

      const token_response = {
        token_type: "Bearer",
        id_token: jwt.sign(ipayload, privateKey, {
          algorithm: "ES256",
        }),
      };

      reply.send(token_response);
    },
  });
});
