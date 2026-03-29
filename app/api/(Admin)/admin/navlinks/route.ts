import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// GET /api/(Admin)/admin/navlinks
export async function GET() {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const navLinks = await NavLink.find().sort({ order: 1 }).lean();
  return NextResponse.json({ data: navLinks });
}

// POST /api/(Admin)/admin/navlinks
export async function POST(req: Request) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug, label, order } = await req.json();
    if (!slug || !label) return NextResponse.json({ error: 'slug and label required' }, { status: 400 });
    await connectDB();
    const nl = await NavLink.create({ slug, label, order: order || 0, midLinks: [], contentBlocks: [] });
    return NextResponse.json({ data: nl }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
