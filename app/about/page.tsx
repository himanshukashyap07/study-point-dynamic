"use client";

import ContentRenderer from '../components/ContentRenderer';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {

    async function getAboutBlocks() {
      const res = await axios.get(`/api/content/${"about"}`)
      if (res.status !== 200) {
        console.error('Failed to fetch about content:', res.statusText);
        return [];
      }
      const content = res.data.data;
      if (content && content.blocks) {
        setBlocks(content.blocks);
      } else {
        setBlocks([]);
        console.warn('No content found for about page');
      }
    }
    getAboutBlocks();
  },[])

  return (
    <div className="content-page">
      <Breadcrumbs items={[{ label: 'About' }]} />

      <h1 className="article-title">About StudyPoint</h1>

      <div className="article-meta">
        <span>StudyPoint Team</span>
        <span>Institutional Profile</span>
      </div>

      <div>
        {blocks.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '4rem' }}>
            <p>About section content is being curated. Check back soon!</p>
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
