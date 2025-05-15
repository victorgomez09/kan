import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { env } from "~/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, contentType } = req.body;

    const client = new S3Client({
      forcePathStyle: true,
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
    const signedUrl = await createPresignedPost(client, {
      Bucket: env.NEXT_PUBLIC_AVATAR_BUCKET_NAME ?? "",
      Key: filename,

      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": contentType,
      },
      Expires: 600,
    });

    const { url, fields } = signedUrl;

    return res.status(200).json({ url, fields });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
