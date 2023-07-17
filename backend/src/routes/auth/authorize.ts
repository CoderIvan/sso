import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { URL } from "url";
import codes, { CodeValue } from "../../domain/codes";
import { FastifyPluginAsync } from "fastify";

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

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/authorize",
    schema: {
      tags: ["auth"],
      querystring: z.object({
        response_type: z.enum(["code"]),
        client_id: z.string(),
        redirect_uri: z.string(),
        state: z.string(),
        scope: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      if (!(req.session && req.session.user_id)) {
        reply.redirect("/login.html" + "?return_to=" + req.url)
        return
      }

      const client = await fastify.prisma.client.findUnique({
        select: {
          redirect_uris: true,
        },
        where: {
          client_id: req.query.client_id,
        },
      });
      // 检查client_id是否存在
      if (!client) {
        return reply.redirect(
          buildUrl(req.query.redirect_uri, {
            error: "client_id不存在",
          })
        );
      }
      // 检查redirect_uri是否为client_id所指定的之一
      const uris = client.redirect_uris.split(";;");
      if (!uris.includes(req.query.redirect_uri)) {
        return reply.redirect(
          buildUrl(req.query.redirect_uri, {
            error: "无效的redirect_uri",
          })
        );
      }

      const user = await fastify.prisma.user.findUniqueOrThrow({
        select: {
          id: true,
          login_name: true,
        },
        where: {
          id: req.session.user_id,
        },
      });

      if (req.query.response_type === "code") {
        var code = await codes.genAndSet(
          new CodeValue(user.id, user.login_name, req.query.scope)
        );
        return reply.redirect(
          buildUrl(req.query.redirect_uri, {
            code: code,
            state: req.query.state,
          })
        );
      } else {
        return reply.redirect(
          buildUrl(req.query.redirect_uri, {
            error: "不支持的response type",
          })
        );
      }
    },
  });
};

export default router;
