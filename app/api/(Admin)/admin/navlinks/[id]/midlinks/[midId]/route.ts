import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// PUT — update mid-link
export async function PUT(req: Request, ctx: { params: Promise<{ id: string; midId: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, midId } = await ctx.params;
  const body = await req.json();
  await connectDB();

  const nl = await NavLink.findById(id);
  if (!nl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const mid = nl.midLinks.id(midId);
  if (!mid) return NextResponse.json({ error: 'MidLink not found' }, { status: 404 });

  Object.assign(mid, body);
  await nl.save();
  return NextResponse.json({ data: nl });
}

// DELETE — remove mid-link
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; midId: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, midId } = await ctx.params;
  await connectDB();

  const nl = await NavLink.findById(id);
  if (!nl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  nl.midLinks.id(midId)?.deleteOne();
  await nl.save();
  return NextResponse.json({ success: true });
}
