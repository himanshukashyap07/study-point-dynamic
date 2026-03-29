"use client";

import ContentRenderer from '../components/ContentRenderer';
import connectDB from '@/lib/db';
import PageContent from '@/lib/models/PageContent';

// Revalidate cache every hour to pick up new content
// export const revalidate = 3600; // Removed: not valid in client components



import Breadcrumbs from '../components/Breadcrumbs';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ContactPage() {
  // const blocks = await getContactBlocks();
  const [blocks, setBlocks] = useState<any[]>([]);
  useEffect(() => {
    async function getContactBlocks() {
      // await connectDB();
      const res = await axios.get(`/api/content/${"contact"}`)
      if (res.status !== 200) {
        console.error('Failed to fetch contact content:', res.statusText);
        return [];
      }
      const content = res.data.data;
      if (content && content.blocks) {
        setBlocks(content.blocks);
      } else {
        setBlocks([]);
        console.warn('No content found for contact page');
      }
    }
    getContactBlocks()
  })

  return (
    <div className="content-page">
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <h1 className="article-title">Contact Us</h1>

      <div className="article-meta">
        <span>Support Team</span>
        <span>Help & Support</span>
      </div>

      <div>
        {blocks.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '4rem' }}>
            <p>Contact details are currently being updated.</p>
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
