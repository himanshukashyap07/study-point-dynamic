import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// PUT /api/(Admin)/admin/navlinks/[id]
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();
  await connectDB();
  const nl = await NavLink.findByIdAndUpdate(id, body, { new: true });
  if (!nl) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: nl });
}

// DELETE /api/(Admin)/admin/navlinks/[id]
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  await connectDB();
  await NavLink.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
