import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Reel from '@/lib/models/Reel';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: Request) {


  await connectDB();
  const reels = await Reel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: reels });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, videoUrl, category } = await req.json();
    if (!title || !videoUrl || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const reel = await Reel.create({ title, videoUrl, category });
    return NextResponse.json({ data: reel }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
