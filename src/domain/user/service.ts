import * as crypto from "crypto";
import * as argon2 from "argon2";

export class User {
  id!: number;

  login_name!: string;

  hash_password!: string;

  frontend_salt!: string;

  disabled!: boolean;

  create_at!: number;

  create_by!: number;
}

function sha256(password: string, frontend_salt: string) {
  return crypto
    .createHmac("sha256", Buffer.from(frontend_salt, "hex"))
    .update(Buffer.from(password, "ascii"))
    .digest();
}

export async function create(
  login_name: string,
  password: string
): Promise<User> {
  const frontend_salt = crypto.randomBytes(16).toString("hex");
  const backend_password = sha256(password, frontend_salt);
  const now = Math.floor(Date.now() / 1000);
  const user = new User();
  user.login_name = login_name;
  user.frontend_salt = frontend_salt;
  user.hash_password = await argon2.hash(backend_password);
  user.create_at = now;
  return user;
}

export async function checkPassword(
  { hash_password, frontend_salt }: User,
  password: string
): Promise<boolean> {
  const backend_password = sha256(password, frontend_salt);

  return argon2.verify(hash_password, backend_password);
}
