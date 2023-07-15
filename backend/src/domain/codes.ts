import * as crypto from "crypto";

export class CodeValue {
  id: number;
  login_name: string;
  constructor(id: number, login_name: string) {
    this.id = id;
    this.login_name = login_name;
  }
}

class Codes {
  private codes: Record<string, CodeValue> = {};

  private async set(key: string, value: CodeValue): Promise<void> {
    this.codes[key] = value;
  }

  private async gen(): Promise<string> {
    const code = crypto.randomBytes(16).toString("hex");
    return code;
  }

  private async get(key: string): Promise<CodeValue> {
    return this.codes[key];
  }

  private async delete(key: string): Promise<void> {
    delete this.codes[key];
  }

  async getAndDelete(key: string): Promise<CodeValue> {
    const value = await this.get(key);
    await this.delete(key);
    return value;
  }

  async genAndSet(value: CodeValue): Promise<string> {
    const code = await this.gen();
    await this.set(code, value);
    return code;
  }
}

export default new Codes();
