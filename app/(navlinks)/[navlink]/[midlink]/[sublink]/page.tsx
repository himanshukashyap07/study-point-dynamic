"use client";
import ContentRenderer from '@/app/components/ContentRenderer';
import type { ContentBlock } from '@/app/components/ContentRenderer';
import axios from 'axios';

interface SubLinkData { slug: string; label: string; contentBlocks: ContentBlock[]; }
interface MidLinkData { slug: string; label: string; subLinks: SubLinkData[]; }
interface NavLinkData { slug: string; label: string; midLinks: MidLinkData[]; }


// Revalidate cache every hour to pick up new content
// export const revalidate = 3600; // Removed: not valid in client components

// async function getData(nav: string, mid: string, sub: string) {
//   const res = await axios.get(`/api/navlinks/navlik?slug=${nav}`)
//   const nl: NavLinkData | null = res.data.data.length > 0 ? res.data.data[0] : null;
//   if (!nl) return null;
//   // const nl = await NavLink.findOne({ slug: nav }).lean();
//   const ml = (nl.midLinks as any[]).find(m => m.slug === mid);
//   if (!ml) return null;
//   const sl = (ml.subLinks || []).find((s: any) => s.slug === sub);
//   return { nl, ml, sl };
// }

import Breadcrumbs from '@/app/components/Breadcrumbs';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubLinkPage() {
  const params = useParams();
  const navlink = params.navlink as string;
  const midlink = params.midlink as string;
  const sublink = params.sublink as string;
  const [result, setResult] = useState<{ nl: NavLinkData; ml: MidLinkData; sl: SubLinkData } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`/api/navlinks/navlink?slug=${navlink}`);
        const nl: NavLinkData | null = res.data.data.length > 0 ? res.data.data[0] : null;
        if (!nl) {
          setResult(null);
          return;
        }
        const ml = (nl.midLinks as any[]).find(m => m.slug === midlink);
        if (!ml) {
          setResult(null);
          return;
        }
        const sl = (ml.subLinks || []).find((s: any) => s.slug === sublink);
        if (!sl) {
          setResult(null);
          return;
        }
        setResult({ nl, ml, sl });
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    if (navlink && midlink && sublink) {
      fetchData();
    }
  }, [navlink, midlink, sublink]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!result || !result.sl) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="content-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <p>Topic not found.</p>
        </div>
      </div>
    );
  }

  const { nl, ml, sl } = result;

  return (
    <div className="content-page">
      <Breadcrumbs items={[
        { label: nl.label, href: `/${navlink}` },
        { label: ml.label, href: `/${navlink}/${midlink}` },
        { label: sl.label }
      ]} />
      
      <h1 className="article-title">{sl.label}</h1>
      
      <div className="article-meta">
        <span>StudyPoint</span>
        <span>{sl.label} Materials</span>
      </div>

      <ContentRenderer blocks={sl.contentBlocks || []} />
    </div>
  );
}
