import * as crypto from "crypto";

export class Client {
  name!: string;
  client_id!: string;
  client_secret!: string;
  redirect_uris!: string;
  disabled!: boolean;
  create_at!: number;
  create_by!: number;
}

export function create(
  name: string,
  redirect_uris: string,
  client_id: string = crypto.randomBytes(16).toString("hex"),
  client_secret: string = crypto.randomBytes(16).toString("hex")
): Client {
  const client = new Client();
  client.name = name;
  client.client_id = client_id;
  client.client_secret = client_secret;
  client.redirect_uris = redirect_uris;
  client.create_at = Math.floor(Date.now() / 1000);
  return client;
}
