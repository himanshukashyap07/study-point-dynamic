import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PageContent from '@/lib/models/PageContent';

// GET /api/content/[pageSlug]
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    await connectDB();
    const doc = await PageContent.findOne({ pageSlug:slug }).lean();
    return NextResponse.json({ data: doc || { slug, blocks: [] } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
