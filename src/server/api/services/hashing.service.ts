import { injectable } from "tsyringe";
import { Scrypt } from "oslo/password";

@injectable()
export class HashingService {
  private readonly hasher = new Scrypt();

  async hash(data: string) {
    return this.hasher.hash(data);
  }

  async verify(hash: string, data: string) {
    return this.hasher.verify(hash, data);
  }
}

