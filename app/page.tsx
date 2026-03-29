"use client";

import ContentRenderer from './components/ContentRenderer';


import Breadcrumbs from './components/Breadcrumbs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {
    async function getHomeBlocks() {
      // await connectDB();
      const res = await axios.get(`/api/content/${"home"}`)
      if (res.status !== 200) {
        console.error('Failed to fetch home content:', res.statusText);
        return [];
      }
      const content = res.data.data;
      if (content && content.blocks) {
        setBlocks(content.blocks);
      } else {
        setBlocks([]);
        console.warn('No content found for terms page');
      }
    }
    getHomeBlocks()
  }, [])

  return (
    <div className="content-page">
      <Breadcrumbs items={[]} /> {/* Empty items for home breadcrumb "Home" */}

      <h1 className="article-title">Welcome to StudyPoint</h1>

      <div className="article-meta">
        <span>StudyPoint Team</span>
        <span>Home Page</span>
      </div>

      <div style={{ paddingBottom: '4rem' }}>
        {blocks.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-soft)' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Content Awaiting Update</h2>
            <p>Our academic team is currently populating this section with premium resources.</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="/admin" className="btn btn-outline btn-sm">Admin Access</a>
            </div>
          </div>
        ) : (
          <ContentRenderer blocks={blocks as any} />
        )}
      </div>
    </div>
  );
}
