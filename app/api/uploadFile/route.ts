
import ImageKit from 'imagekit';

import { NextResponse } from 'next/server';

const ALLOWED_FILES_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(req: Request) {
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_IMAGEKIT_URL_ENDPOINT!,
  });

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: "no file provided", success: false }, { status: 400 })
  }
  if (!ALLOWED_FILES_TYPES.includes(file.type)) {
    return NextResponse.json({ message: "file formate is not supported", success: false }, { status: 400 })
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
    });
    return NextResponse.json({ message: "file upload successully", uploadResponse, success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: "interl server error in sending message", success: false }, { status: 500 })
  }
}
