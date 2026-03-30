import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Reel from '@/lib/models/Reel';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    await connectDB();
    
    let query = {};
    if (category) {
      query = { category };
    }
    
    const reels = await Reel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data: reels });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
