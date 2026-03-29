import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavLink from '@/lib/models/NavLink';

export async function GET(req:NextRequest) {
    const {searchParams} = new URL(req.url)
    const slug = searchParams.get("slug")
    try {
        await connectDB();
        const navLinks = await NavLink.find({slug}).sort({ order: 1 }).lean();
        return NextResponse.json({ data: navLinks });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch nav links' }, { status: 500 });
    }
}
