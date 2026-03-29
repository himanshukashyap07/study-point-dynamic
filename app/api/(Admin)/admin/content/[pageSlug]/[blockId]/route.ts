import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageContent from '@/lib/models/PageContent';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/options';


// PUT — update a single block
export async function PUT(req: Request, ctx: { params: Promise<{ pageSlug: string; blockId: string }> }) {
  const session = await getServerSession(authOption)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageSlug, blockId } = await ctx.params;
  const body = await req.json();
  await connectDB();

  const doc = await PageContent.findOne({ pageSlug });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const block = doc.blocks.id(blockId);
  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 });

  Object.assign(block, body);
  await doc.save();
  return NextResponse.json({ data: doc });
}

// DELETE — remove a single block
export async function DELETE(_req: Request, ctx: { params: Promise<{ pageSlug: string; blockId: string }> }) {
  const session = await getServerSession(authOption);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageSlug, blockId } = await ctx.params;
  await connectDB();

  const doc = await PageContent.findOne({ pageSlug });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  doc.blocks.id(blockId)?.deleteOne();
  await doc.save();
  return NextResponse.json({ success: true });
}
