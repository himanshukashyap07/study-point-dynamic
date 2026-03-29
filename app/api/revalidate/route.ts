import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Verify request is from Vercel or local
    const secret = req.nextUrl.searchParams.get('secret');

    // You can set this in Vercel env or use a default for local testing
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'your-secret-key';

    if (secret !== revalidateSecret) {
        return NextResponse.json(
            { message: 'Invalid secret' },
            { status: 401 }
        );
    }

    try {
        // Get the path to revalidate from query params or body
        const pathParam = req.nextUrl.searchParams.get('path');
        const paths = pathParam ? [pathParam] : [
            '/',
            '/about',
            '/contact',
            '/privacy-policy',
            '/terms',
            // Dynamic routes - you may need to add specific paths if needed
        ];

        paths.forEach(path => {
            revalidatePath(path);
        });

        console.log(`[Revalidate] Cleared cache for paths:`, paths);

        return NextResponse.json(
            {
                message: 'Revalidation successful',
                revalidatedPaths: paths
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Revalidate] Error:', error);
        return NextResponse.json(
            { message: 'Revalidation failed' },
            { status: 500 }
        );
    }
}
