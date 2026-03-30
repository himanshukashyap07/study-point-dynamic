import type { Metadata } from 'next';
import Reel from '@/lib/models/Reel';
import connectDB from '@/lib/db';

export const metadata: Metadata = {
  title: 'Stories | StudyPoint',
  description: 'Watch our latest stories and vertical videos.',
};

export const revalidate = 60;

export default async function StoryPage() {
  await connectDB();
  const reels = await Reel.find({ category: 'story' }).sort({ createdAt: -1 }).lean();

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="article-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Latest Stories</h1>
        
        {reels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)', fontSize: '1.1rem' }}>
            <p>No stories available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="reels-grid">
            {reels.map((r: any) => (
              <div key={r._id.toString()} className="reel-item">
                <video src={r.videoUrl} controls preload="metadata" playsInline />
                <div className="reel-info">
                  <h3 className="reel-title">{r.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
