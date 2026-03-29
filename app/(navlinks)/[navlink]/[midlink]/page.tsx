"use client";

import ContentRenderer from '@/app/components/ContentRenderer';
import type { ContentBlock } from '@/app/components/ContentRenderer';


interface SubLink { slug: string; label: string; }
interface MidLinkData { _id: string; slug: string; label: string; contentBlocks: ContentBlock[]; subLinks: SubLink[]; }
interface NavLinkData { slug: string; label: string; midLinks: MidLinkData[]; }

// Revalidate cache every hour to pick up new content
// export const revalidate = 3600; // Removed: not valid in client components

// async function getMidLink(navSlug: string, midSlug: string): Promise<{ navLabel: string; mid: MidLinkData } | null> {
//   try {
//     const res = await axios.get(`/api/navlinks/navlink?slug=${navSlug}`);
//     const nav: NavLinkData | null = res.data.data.length > 0 ? res.data.data[0] : null;
//     if (!nav) return null;
//     const mid = (nav.midLinks as any[]).find((m) => m.slug === midSlug);
//     if (!mid) return null;
//     return { navLabel: nav.label, mid: mid as MidLinkData };
//   } catch { return null; }
// }

import Breadcrumbs from '@/app/components/Breadcrumbs';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MidLinkPage() {
  const params = useParams();
  const navlink = params.navlink as string;
  const midlink = params.midlink as string;
  const [result, setResult] = useState<{ navLabel: string; mid: MidLinkData } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`/api/navlinks/navlink?slug=${navlink}`);
        const nav: NavLinkData | null = res.data.data.length > 0 ? res.data.data[0] : null;
        if (!nav) {
          setResult(null);
          return;
        }
        const mid = (nav.midLinks as any[]).find((m) => m.slug === midlink);
        if (!mid) {
          setResult(null);
          return;
        }
        setResult({ navLabel: nav.label, mid: mid as MidLinkData });
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    if (navlink && midlink) {
      fetchData();
    }
  }, [navlink, midlink]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!result) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="content-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <p>Section not found.</p>
        </div>
      </div>
    );
  }

  const { navLabel, mid } = result;

  return (
    <div className="content-page">
      <Breadcrumbs items={[
        { label: navLabel, href: `/${navlink}` },
        { label: mid.label }
      ]} />
      
      <h1 className="article-title">{mid.label}</h1>
      
      <div className="article-meta">
        <span>👤 StudyPoint</span>
        <span>🏷️ {mid.label} Resources</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
        {(mid.subLinks || []).map((sl: any) => (
          <a key={sl.slug} href={`/${navlink}/${midlink}/${sl.slug}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {sl.label}
          </a>
        ))}
      </div>
      
      <ContentRenderer blocks={mid.contentBlocks || []} />
    </div>
  );
}
