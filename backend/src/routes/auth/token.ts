import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import codes from "../../domain/codes";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import { FastifyPluginAsync } from "fastify";
import * as querystring from "querystring";
import * as crypto from "crypto";

const privateKey = fs.readFileSync(
  path.join(__dirname, "../../../.private.key")
);

function decodeClientCredentials(auth: string): {
  client_id: string;
  client_secret: string;
} {
  const [id, secret] = Buffer.from(auth.slice("basic ".length), "base64")
    .toString()
    .split(":");
  const client_id = querystring.unescape(id);
  const client_secret = querystring.unescape(secret);
  return { client_id, client_secret };
}

const router: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/token",
    schema: {
      tags: ["auth"],
      headers: z.object({
        authorization: z.string(),
      }),
      body: z.union([
        z.object({
          grant_type: z.literal("authorization_code"),
          code: z.string(),
        }),
        z.object({
          grant_type: z.literal("client_credentials"),
        })
      ]),
      response: {
        200: z.object({
          access_token: z.string(),
          token_type: z.string(),
          id_token: z.string().optional(),
        }),
        400: z.object({
          message: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const auth = req.headers.authorization;
      if (!auth) {
        reply.code(400).send({ message: "无效认证" });
        return;
      }
      const { client_id, client_secret } = decodeClientCredentials(auth);
      const client = await fastify.prisma.client.findUnique({
        select: {
          client_id: true,
          client_secret: true,
        },
        where: {
          client_id,
        },
      });
      if (!client) {
        reply.code(400).send({ message: "无效client_id" });
        return;
      }
      if (client.client_secret !== client_secret) {
        reply.code(400).send({ message: "无效client_secret" });
        return;
      }

      if (req.body.grant_type === "authorization_code") {
        const user = await codes.getAndDelete(req.body.code);
        if (!user) {
          reply.code(400).send({ message: "无效Code" });
          return;
        }

        const now = Math.floor(Date.now() / 1000)
        let access_token = jwt.sign({
          iss: 'http://localhost:3000/', // TODO
          sub: client_id,
          aud: 'http://localhost:9002/', // TODO
          iat: now,
          exp: now + (5 * 60),
          jti: crypto.randomBytes(16).toString("hex")
        }, privateKey, {
          algorithm: "ES256",
        })

        const token_response: {
          access_token: string;
          token_type: string;
          id_token?: string;
        } = {
          token_type: "Bearer",
          access_token,
        };

        if (user.scope && user.scope.indexOf('openid') > -1) {
          token_response.id_token = jwt.sign({
            iss: 'http://localhost:3000/', // TODO
            sub: user.id,
            aud: client.client_id,
            iat: now,
            exp: now + 5 * 60,
            user: user,
          }, privateKey, {
            algorithm: "ES256",
          })
        }
        reply.send(token_response);
        return
      } else if (req.body.grant_type === "client_credentials") {
        const now = Math.floor(Date.now() / 1000)
        const payload = {
          iss: 'http://localhost:3000/', // TODO
          sub: client_id,
          aud: 'http://localhost:9002/', // TODO
          iat: now,
          exp: now + (5 * 60),
          jti: crypto.randomBytes(16).toString("hex")
        };
        let access_token = jwt.sign(payload, privateKey, {
          algorithm: "ES256",
        })
        const token_response = {
          token_type: "Bearer",
          access_token: access_token,
        };
        reply.send(token_response);
        return
      }
    },
  });
};

export default router;
