import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// PUT — update sub-link (label, slug, or contentBlocks)
export async function PUT(req: Request, ctx: { params: Promise<{ id: string; midId: string; subId: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, midId, subId } = await ctx.params;
  const body = await req.json();
  await connectDB();

  const nl = await NavLink.findById(id);
  const mid = nl?.midLinks.id(midId);
  const sub = mid?.subLinks.id(subId);
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  Object.assign(sub, body);
  await nl!.save();
  return NextResponse.json({ data: nl });
}

// DELETE — remove sub-link
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; midId: string; subId: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, midId, subId } = await ctx.params;
  await connectDB();

  const nl = await NavLink.findById(id);
  const mid = nl?.midLinks.id(midId);
  mid?.subLinks.id(subId)?.deleteOne();
  await nl?.save();
  return NextResponse.json({ success: true });
}
