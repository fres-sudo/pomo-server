import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { injectable } from "tsyringe";
import { config } from "../common/config";

@injectable()
export class StorageService {
  constructor(protected readonly s3Client: S3Client) {
    this.s3Client = new S3Client({
      region: config.storage.region,
      endpoint: config.storage.url,
      credentials: {
        accessKeyId: config.storage.accessKey,
        secretAccessKey: config.storage.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(file: File) {
    const key = createId();
    const uploadCommand = new PutObjectCommand({
      Bucket: config.storage.name,
      ACL: "public-read",
      Key: key,
      ContentType: file.type,
      Body: new Uint8Array(await file.arrayBuffer()),
    });

    const response = await this.s3Client.send(uploadCommand);

    return {
      ...response,
      size: file.size,
      name: file.name,
      type: file.type,
      key,
    };
  }

  parseUrl(key: string) {
    return `https://${config.storage.name}.s3.${config.storage.region}.amazonaws.com/${config.storage.name}/${key}`;
  }

  parseKey(url: string) {
    const bucketUrl = `https://${config.storage.name}.s3.${config.storage.region}.amazonaws.com/${config.storage.name}/`;
    if (url.startsWith(bucketUrl)) {
      return url.slice(bucketUrl.length);
    }
    throw new Error("Invalid S3 URL");
  }

  delete(key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: config.storage.name,
      Key: key,
    });

    return this.s3Client.send(deleteCommand);
  }
}
