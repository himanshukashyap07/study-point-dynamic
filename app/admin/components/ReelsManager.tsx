'use client';

import { useState, useEffect, useCallback } from 'react';

interface Reel {
  _id: string;
  title: string;
  videoUrl: string;
  category: string;
  createdAt: string;
}

export default function ReelsManager() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('story');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchReels = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reels', { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      setReels(d.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !videoUrl || !category) return flash('Error: All fields are required.');
    
    setLoading(true);
    const res = await fetch('/api/admin/reels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, videoUrl, category }),
    });
    setLoading(false);

    if (res.ok) {
      flash('Video added successfully!');
      setTitle('');
      setVideoUrl('');
      setCategory('story');
      setShowAdd(false);
      fetchReels();
    } else {
      const { error } = await res.json();
      flash(`Error: ${error}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/reels/${id}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
       flash('Video deleted successfully!');
       fetchReels();
    } else {
       flash('Error deleting video.');
    }
  }

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">🎥 Manage Reels (Vertical Video)</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add New Video'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showAdd && (
        <form onSubmit={handleAdd} className="content-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Vertical Video</h3>
          <div className="form-group">
            <label className="form-label">Video Title</label>
            <input 
              className="form-input" 
              placeholder="E.g., Intro to Accounting" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Video URL (Google Cloud / ImageKit / MP4 link)</label>
            <input 
              className="form-input" 
              placeholder="https://..." 
              value={videoUrl} 
              onChange={(e) => setVideoUrl(e.target.value)} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category Filter</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="story">Story (/story)</option>
              <option value="web-stories">Web Stories (/web-stories)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Video'}
          </button>
        </form>
      )}

      {loading && !showAdd && <p style={{ color: 'var(--gray-400)' }}>Loading videos...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {reels.map((reel) => (
          <div key={reel._id} className="block-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                 <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--gray-800)' }}>{reel.title}</h4>
                 <span className={`block-type-badge`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>{reel.category}</span>
               </div>
               <button className="btn btn-danger btn-sm" onClick={() => handleDelete(reel._id)}>Delete</button>
            </div>
            
            <video 
              src={reel.videoUrl} 
              controls 
              style={{ width: '100%', borderRadius: '8px', aspectRatio: '9/16', objectFit: 'cover', background: '#000' }}
            />
          </div>
        ))}
        {!loading && reels.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
             No videos added yet.
          </div>
        )}
      </div>
    </div>
  );
}
