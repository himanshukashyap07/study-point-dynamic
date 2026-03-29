import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import PageContent from '@/lib/models/PageContent';
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

// GET all blocks for a page
export async function GET(_req: Request, ctx: { params: Promise<{ pageSlug: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageSlug } = await ctx.params;
  await connectDB();
  const doc = await PageContent.findOne({ pageSlug }).lean();
  return NextResponse.json({ data: doc || { pageSlug, blocks: [] } });
}

// POST — add a new content block
export async function POST(req: Request, ctx: { params: Promise<{ pageSlug: string }> }) {
  const session = await getServerSession(authOption);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageSlug } = await ctx.params;
  const block = await req.json();
  await connectDB();

  let doc = await PageContent.findOne({ pageSlug });
  if (!doc) {
    doc = await PageContent.create({ pageSlug, blocks: [block] });
  } else {
    doc.blocks.push(block as never);
    await doc.save();
  }

  // Revalidate the page so updates appear immediately
  revalidatePath(`/${pageSlug}`);

  return NextResponse.json({ data: doc }, { status: 201 });
}
