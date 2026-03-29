"use client";

import ContentRenderer from '../components/ContentRenderer';

// Revalidate cache every hour to pick up new content
// export const revalidate = 3600; // Removed: not valid in client components



import Breadcrumbs from '../components/Breadcrumbs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PrivacyPolicyPage() {
  // const blocks = await getPrivacyBlocks();
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {

    async function getPrivacyBlocks() {
      const res = await axios.get(`/api/content/${"privacy-policy"}`)
      if (res.status !== 200) {
        console.error('Failed to fetch privacy policy content:', res.statusText);
        return [];
      }
      const content = res.data.data;
      // const content = await PageContent.findOne({ pageSlug: 'about' }).lean();
      if (content && content.blocks) {
        setBlocks(content.blocks);
      } else {
        setBlocks([]);
        console.warn('No content found for privacy policy page');
      }
    }
    getPrivacyBlocks();
  }, [])
  return (
    <div className="content-page">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <h1 className="article-title">Privacy Policy</h1>

      <div className="article-meta">
        <span>Legal Team</span>
        <span>Data Protection</span>
      </div>

      <div>
        {blocks.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '4rem' }}>
            <p>Privacy Policy content is currently being updated by our legal team.</p>
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
