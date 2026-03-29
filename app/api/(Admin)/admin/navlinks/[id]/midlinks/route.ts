import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// POST — add mid-link to a navlink
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { slug, label, order } = await req.json();
  if (!slug || !label) return NextResponse.json({ error: 'slug and label required' }, { status: 400 });
  await connectDB();

  const nl = await NavLink.findById(id);
  if (!nl) return NextResponse.json({ error: 'NavLink not found' }, { status: 404 });

  nl.midLinks.push({ slug, label, order: order || 0, subLinks: [], contentBlocks: [] } as never);
  await nl.save();
  return NextResponse.json({ data: nl }, { status: 201 });
}
