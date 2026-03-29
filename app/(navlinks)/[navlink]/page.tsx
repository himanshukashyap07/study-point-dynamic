"use client";

import ContentRenderer from '@/app/components/ContentRenderer';
import type { ContentBlock } from '@/app/components/ContentRenderer';

interface MidLink { _id: string; slug: string; label: string; subLinks: { slug: string; label: string }[]; }
interface NavLinkData { _id: string; slug: string; label: string; contentBlocks: ContentBlock[]; midLinks: MidLink[]; }


// Revalidate cache every hour to pick up new content
// export const revalidate = 3600; // Removed: not valid in client components

// async function getNavLink(slug: string): Promise<any | null> {

//   const res = await axios.get(`/api/navlinks/navlink?slug=${slug}`);
//   return res.data.data.length > 0 ? res.data.data[0] : null;
// }

import Breadcrumbs from '@/app/components/Breadcrumbs';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavLinkPage() {
  const params = useParams();
  const navlink = params.navlink as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`/api/navlinks/navlink?slug=${navlink}`);
        const fetchedData = res.data.data.length > 0 ? res.data.data[0] : null;
        setData(fetchedData);
      } catch (error) {
        console.error('Failed to fetch navlink data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    if (navlink) {
      fetchData();
    }
  }, [navlink]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="content-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <p style={{ marginTop: '1rem' }}>Section not found.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="content-page">
      <Breadcrumbs items={[{ label: data.label }]} />
      <h1 className="article-title">{data.label}</h1>
      <div className="article-meta">
        <span>StudyPoint</span>
        <span>{data.label} Resources</span>
      </div>

      {(data.midLinks || []).length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
          {data.midLinks.map((ml: any) => (
            <a key={ml._id} href={`/${navlink}/${ml.slug}`} className="btn btn-outline btn-sm">
              {ml.label}
            </a>
          ))}
        </div>
      )}

      <ContentRenderer blocks={data.contentBlocks || []} />
    </div>
  );
}
