"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';

function toDrivePreview(url: string): string {
  if (url.includes('/view')) {
    return url.replace('/view', '/preview');
  }
  if (url.includes('drive.google.com/file') && !url.endsWith('/preview')) {
     return url.endsWith('/') ? `${url}preview` : `${url}/preview`;
  }
  return url;
}

function PDFViewerContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('url');
  let url = rawUrl ? decodeURIComponent(rawUrl) : '';

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
        <h2>Invalid PDF Link</h2>
        <p>The requested document could not be found.</p>
      </div>
    );
  }

  const isDrive = url.includes('drive.google.com');
  // Format Drive URL to prevent Auth redirect loop inside iframe
  if (isDrive) url = toDrivePreview(url);
  
  // Format Standard PDF UI to hide toolbars
  const iframeSrc = isDrive ? url : url.includes('#') ? url : url.includes('?') ? `${url}&toolbar=0&navpanes=0&scrollbar=0` : `${url}#toolbar=0&navpanes=0&scrollbar=0`;

  // Provide a clean fallback to open raw if iframe gets blocked (e.g. CORS issues)
  return (
    <div className="content-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="article-title" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--blue-900)' }}>Document Viewer</h1>
        <a 
          href={url} 
          download="Document.pdf"
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-primary" 
          style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          <span>⬇️</span> Download PDF
        </a>
      </div>
      
      <div 
        style={{ width: '100%', height: '80vh', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', backgroundColor: 'var(--gray-50)', position: 'relative' }}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      >
        <iframe 
          src={iframeSrc} 
          width="100%" 
          height="100%" 
          style={{ border: 'none', pointerEvents: 'auto' }}
          title="PDF Viewer"
        />
        {/* Fallback overlay incase PDF fails to load in iframe natively on certain devices */}
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', pointerEvents: 'none' }}>
           <a href={url} target="_blank" rel="noreferrer" style={{ pointerEvents: 'auto', background: 'var(--white)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--gray-600)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
             Open Native Viewer ↗
           </a>
        </div>
      </div>
    </div>
  );
}

export default function ShowPDFPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading document...</div>}>
      <PDFViewerContent />
    </Suspense>
  );
}
