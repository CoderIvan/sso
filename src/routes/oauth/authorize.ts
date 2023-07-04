import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { URL } from "url";
import * as crypto from "crypto";
import codes, { CodeValue } from "./codes";
import fp from "fastify-plugin";

function buildUrl(
  base: string,
  options: Record<string, any>,
  hash?: string
): string {
  const newUrl = new URL(base);
  Object.keys(options).forEach((key) => {
    newUrl.searchParams.set(key, options[key]);
  });
  if (hash) {
    newUrl.hash = hash;
  }
  return newUrl.toString();
}

export default fp(async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/authorize",
    schema: {
      tags: ["oauth2.0"],
      querystring: z.object({
        redirect_uri: z.string(),
        state: z.string(),
      }),
    },
    async handler(request, reply) {
      request.session.user_id = 2; // TODO TEST ONLY
      const user = await fastify.prisma.user.findUniqueOrThrow({
        select: {
          id: true,
          login_name: true,
        },
        where: {
          id: request.session.user_id,
        },
      });

      var code = crypto.randomBytes(16).toString("hex");
      await codes.set(code, new CodeValue(user.id, user.login_name));
      const url = buildUrl(request.query.redirect_uri, {
        code: code,
        state: request.query.state,
      });
      reply.redirect(url);
    },
  });
});
