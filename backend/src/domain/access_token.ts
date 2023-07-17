import * as crypto from "crypto";

export class AccessTokenValue {
  constructor() { }
}

class AccessToken {
  private accessTokenMap: Record<string, AccessTokenValue> = {};

  private async set(key: string, value: AccessTokenValue): Promise<void> {
    this.accessTokenMap[key] = value;
  }

  private async gen(): Promise<string> {
    const access_token = crypto.randomBytes(16).toString("hex");
    return access_token;
  }

  async genAndSet(value: AccessTokenValue): Promise<string> {
    const access_token = await this.gen();
    await this.set(access_token, value);
    return access_token;
  }
}

export default new AccessToken();
