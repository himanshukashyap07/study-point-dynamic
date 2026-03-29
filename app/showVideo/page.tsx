"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function getMediaType(url: string) {
  if (!url) return 'link';
  const u = url.toLowerCase();
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/') || u.includes('youtube.com/embed')) return 'youtube';
  if (u.includes('drive.google.com/file/d/')) return 'drive';
  return 'video';
}

function toYouTubeEmbed(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;
  const longMatch  = url.match(/[?&]v=([^&]+)/);
  if (longMatch)  return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1`;
  if (url.includes('/embed/')) return url;
  return url;
}

function toDrivePreview(url: string): string {
  if (url.includes('/view')) {
    return url.replace('/view', '/preview');
  }
  // Try to append /preview if it just ends at the file ID
  if (!url.endsWith('/preview')) {
     return url.endsWith('/') ? `${url}preview` : `${url}/preview`;
  }
  return url;
}

function VideoViewerContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('url');
  const url = rawUrl ? decodeURIComponent(rawUrl) : '';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Verifying access...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!url) {
    return (
      <div className="content-page" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Invalid Video Link</h2>
        <p>The requested video could not be found.</p>
      </div>
    );
  }

  const mediaType = getMediaType(url);
  const isIframe = mediaType === 'youtube' || mediaType === 'drive';
  let iframeUrl = '';
  
  if (mediaType === 'youtube') iframeUrl = toYouTubeEmbed(url);
  if (mediaType === 'drive') iframeUrl = toDrivePreview(url);

  return (
    <div className="content-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="article-title" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--blue-900)' }}>Video Player</h1>
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-outline" 
          style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          Open Native Media ↗
        </a>
      </div>
      
      <div 
        style={{ width: '100%', aspectRatio: '16/9', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      >
        {isIframe ? (
          <iframe 
            src={iframeUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Viewer"
          />
        ) : (
          <video 
            src={url} 
            controls 
            controlsList="nodownload"
            autoPlay 
            style={{ width: '100%', height: '100%', outline: 'none' }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}

export default function ShowVideoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading video...</div>}>
      <VideoViewerContent />
    </Suspense>
  );
}
