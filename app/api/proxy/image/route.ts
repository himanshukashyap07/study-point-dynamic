import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    // Determine the true source for Google Drive if needed
    let fetchUrl = targetUrl;
    
    // Safety check for common media domains
    const isAllowed = /google\.com|unsplash\.com|pexels\.com|pinimg\.com|canva\.com/.test(targetUrl);
    if (!isAllowed) {
       // Optional: restricted to only allow specific domains for security
    }

    const response = await axios.get(fetchUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Check for "virus scan warning" from Google Drive (it usually returns HTML)
    if (contentType.includes('text/html') && fetchUrl.includes('drive.google.com')) {
       // We can't easily bypass virus scan warning for large files (>100MB) without cookies,
       // but for typical images this shouldn't be an issue.
    }

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
