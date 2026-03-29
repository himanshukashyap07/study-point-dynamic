"use client";

import ContentRenderer from '../components/ContentRenderer';


import Breadcrumbs from '../components/Breadcrumbs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TermsPage() {
  // const blocks = await getTermsBlocks();
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {
    async function getTermsBlocks() {
      const res = await axios.get(`/api/content/${"terms"}`)
      if (res.status !== 200) {
        console.error('Failed to fetch terms content:', res.statusText);
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
    getTermsBlocks()
  }, [])

  return (
    <div className="content-page">
      <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />

      <h1 className="article-title">Terms & Conditions</h1>

      <div className="article-meta">
        <span>Legal Team</span>
        <span>User Agreement</span>
      </div>

      <div>
        {blocks.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '4rem' }}>
            <p>Our Terms of Service are currently being updated.</p>
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
