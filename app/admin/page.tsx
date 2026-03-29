'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import AdminSidebar from './components/AdminSidebar';
import ContentEditor from './components/ContentEditor';
import NavLinkManager from './components/NavLinkManager';

interface SubLink  { _id: string; slug: string; label: string; contentBlocks?: any[]; }
interface MidLink  { _id: string; slug: string; label: string; subLinks: SubLink[]; contentBlocks?: any[]; }
interface NavLink  { _id: string; slug: string; label: string; midLinks: MidLink[]; contentBlocks?: any[]; }

function getLabelForKey(key: string, navLinks: NavLink[]): { title: string; slug: string } {
  if (key === '__navlinks__') return { title: '🔗 Manage Navigation', slug: '' };
  if (!key.includes(':')) {
    const labels: Record<string, string> = {
      home: '🏠 Home',
      about: '👤 About Us',
      contact: '📧 Contact',
      'privacy-policy': '📄 Privacy Policy',
      terms: '📄 Terms & Conditions',
    };
    return { title: labels[key] || key, slug: key };
  }

  // Dynamic: nav:id, mid:navId:midId, sub:navId:midId:subId
  const parts = key.split(':');
  if (parts[0] === 'nav') {
    const nl = navLinks.find((n) => n._id === parts[1]);
    return { title: `📂 ${nl?.label || ''}`, slug: '' };
  }
  if (parts[0] === 'mid') {
    const nl = navLinks.find((n) => n._id === parts[1]);
    const ml = nl?.midLinks.find((m) => m._id === parts[2]);
    return { title: `📂 ${nl?.label} / ${ml?.label || ''}`, slug: '' };
  }
  if (parts[0] === 'sub') {
    const nl = navLinks.find((n) => n._id === parts[1]);
    const ml = nl?.midLinks.find((m) => m._id === parts[2]);
    const sl = ml?.subLinks.find((s) => s._id === parts[3]);
    return { title: `📄 ${nl?.label} / ${ml?.label} / ${sl?.label || ''}`, slug: '' };
  }
  return { title: key, slug: key };
}

function getContentSlug(key: string, navLinks: NavLink[]): string | null {
  // Static pages - direct slug
  const staticPages = ['home', 'about', 'contact', 'privacy-policy', 'terms'];
  if (staticPages.includes(key)) return key;

  // For nav/mid/sub content — we store content on the navlink subdocument
  // Content editor for dynamic navlink levels is handled via navlink API
  return null;
}

export default function AdminPage() {
  const [navLinks, setNavLinks]   = useState<NavLink[]>([]);
  const [selected, setSelected]   = useState<string>('home');

  const fetchNavLinks = useCallback(async () => {
    const res = await fetch('/api/admin/navlinks',{cache:'no-store'});
    if (res.ok) { const d = await res.json(); setNavLinks(d.data || []); }
  }, []);

  useEffect(() => { fetchNavLinks(); }, [fetchNavLinks]);

  async function handleLogout() {
    await signOut({ callbackUrl: '/admin/login' });
  }

  const info       = getLabelForKey(selected, navLinks);
  const staticSlug = getContentSlug(selected, navLinks);

  // Determine what to show in right panel
  const showNavManager = selected === '__navlinks__';
  const showNavContent = selected.startsWith('nav:') || selected.startsWith('mid:') || selected.startsWith('sub:');

  return (
    <div className="admin-layout">
      <AdminSidebar navLinks={navLinks} selected={selected} onSelect={setSelected} />

      <div className="admin-content">
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </div>

        {showNavManager && (
          <NavLinkManager navLinks={navLinks} onRefresh={fetchNavLinks} />
        )}

        {staticSlug && (
          <ContentEditor pageSlug={staticSlug} title={info.title} />
        )}

        {showNavContent && !showNavManager && (
          <NavContentEditor selectedKey={selected} navLinks={navLinks} onRefresh={fetchNavLinks} />
        )}

        {!showNavManager && !staticSlug && !showNavContent && (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
            <p>Select a page or section from the left panel to manage its content.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NavContentEditor: Manage content blocks on nav/mid/sub pages ─────── */
function NavContentEditor({ selectedKey, navLinks, onRefresh }: {
  selectedKey: string;
  navLinks: NavLink[];
  onRefresh: () => void;
}) {
  const [blocks, setBlocks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editBlockIdx, setEditBlockIdx] = useState<number | null>(null);
  const [msg, setMsg]         = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const parts   = selectedKey.split(':');
  const level   = parts[0]; // nav | mid | sub
  const navId   = parts[1];
  const midId   = parts[2];
  const subId   = parts[3];
  const info    = getLabelForKey(selectedKey, navLinks);

  const nl = navLinks.find((n) => n._id === navId);
  const ml = nl?.midLinks.find((m) => m._id === midId);
  const sl = ml?.subLinks.find((s) => s._id === subId);

  useEffect(() => {
    if (level === 'nav')  setBlocks((nl?.contentBlocks) || []);
    if (level === 'mid')  setBlocks((ml?.contentBlocks) || []);
    if (level === 'sub')  setBlocks((sl?.contentBlocks) || []);
    setEditBlockIdx(null);
    setShowAdd(false);
  }, [selectedKey, navLinks, level, nl, ml, sl]);

  async function saveBlock(block: any, idx?: number) {
    setLoading(true);
    let url = '';
    let currentBlocks: any[] = [];

    if (level === 'nav') {
      currentBlocks = [...((nl?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}`;
    } else if (level === 'mid') {
      currentBlocks = [...((ml?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}/midlinks/${midId}`;
    } else if (level === 'sub') {
      currentBlocks = [...((sl?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}/midlinks/${midId}/sublinks/${subId}`;
    }

    if (typeof idx === 'number') {
      currentBlocks[idx] = block;
    } else {
      currentBlocks.push(block);
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentBlocks: currentBlocks }),
    });
    setLoading(false);
    if (res.ok) {
      flash(typeof idx === 'number' ? 'Block updated!' : 'Block added!');
      setShowAdd(false);
      setEditBlockIdx(null);
      onRefresh();
    } else {
      flash('Error saving block');
    }
  }

  async function deleteBlock(idx: number) {
    if (!confirm('Delete this block?')) return;
    let url = '';
    let currentBlocks: any[] = [];

    if (level === 'nav') {
      currentBlocks = [...((nl?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}`;
    } else if (level === 'mid') {
      currentBlocks = [...((ml?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}/midlinks/${midId}`;
    } else if (level === 'sub') {
      currentBlocks = [...((sl?.contentBlocks as any[]) || [])];
      url = `/api/admin/navlinks/${navId}/midlinks/${midId}/sublinks/${subId}`;
    }

    currentBlocks.splice(idx, 1);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentBlocks: currentBlocks }),
    });
    if (res.ok) { flash('Deleted!'); onRefresh(); }
  }

  return (
    <div>
      <div className="admin-content__header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>Currently Editing:</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 className="admin-content__title" style={{ margin: 0 }}>{info.title}</h2>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Content Block</button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
      {loading && <p style={{ color: 'var(--gray-400)' }}>Saving…</p>}

      {(blocks as {type:string;title?:string}[]).length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
          <p>No content blocks. Click &quot;+ Add Content Block&quot;.</p>
        </div>
      ) : (
        (blocks as {type:string;title?:string}[]).map((block, idx) => (
          <div key={idx} className="block-card">
            <div className="block-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`block-type-badge ${block.type}`}>{block.type}</span>
                <span style={{ fontWeight: 600 }}>{block.title || '(no title)'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setEditBlockIdx(idx); setShowAdd(false); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteBlock(idx)}>Delete</button>
              </div>
            </div>
            {block.type === 'paragraph' ? (
              <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {(block as any).text?.slice(0, 100)}...
              </p>
            ) : block.type === 'image' ? (
              <p style={{ color: 'var(--gray-500)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                🖼️ {(block as any).image || 'No image URL set'}
              </p>
            ) : (
              <p style={{ color: 'var(--gray-500)', fontSize: '0.825rem' }}>
                Full editor available via &quot;Edit&quot; button.
              </p>
            )}
          </div>
        ))
      )}

      {(showAdd || editBlockIdx !== null) && (
        <FullBlockForm
          initial={editBlockIdx !== null ? (blocks[editBlockIdx] as any) : null}
          parentTitle={info.title}
          onClose={() => { setShowAdd(false); setEditBlockIdx(null); }}
          onSave={(b) => saveBlock(b, editBlockIdx !== null ? editBlockIdx : undefined)}
        />
      )}
    </div>
  );
}

/* Complete block form for nav content */
function FullBlockForm({ initial, parentTitle, onClose, onSave }: {
  initial: any | null;
  parentTitle: string;
  onClose: () => void;
  onSave: (b: any) => void;
}) {
  const [type, setType]   = useState(initial?.type || 'paragraph');
  const [title, setTitle] = useState(initial?.title || '');
  const [image, setImage] = useState(initial?.image || '');
  const [text, setText]   = useState(initial?.text || '');
  const [data, setData]   = useState<any>(initial?.data || (type === 'table' ? [{title:'',link:''}] : type === 'qa' ? [{question:'',links:['']}] : [{text:'',link:''}]));
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploadFile', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.uploadResponse?.url) {
        setImage(data.uploadResponse.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    onSave({ type, title, image: image || undefined, text: type === 'paragraph' ? text : undefined, data: (type !== 'paragraph' && type !== 'image') ? data : undefined });
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal__header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="modal__title">{initial ? 'Edit Block' : 'Add Content Block'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.1rem' }}>Editing content for: {parentTitle}</span>
          </div>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="form-group">
          <label className="form-label">Block Type</label>
          {initial ? (
             <span className={`block-type-badge ${type}`} style={{ textTransform: 'capitalize' }}>{type}</span>
          ) : (
            <select className="form-select" value={type} onChange={(e) => {
              const t = e.target.value;
              setType(t);
              setData(t === 'table' ? [{title:'',link:''}] : t === 'qa' ? [{question:'',links:['']}] : t === 'list' ? [{text:'',link:''}] : null);
            }}>
              <option value="paragraph">📝 Paragraph</option>
              <option value="table">📊 Table</option>
              <option value="qa">❓ Q&amp;A</option>
              <option value="list">📋 List</option>
              <option value="image">🖼️ Image</option>
              <option value="pdf">📄 PDF</option>
              <option value="video">🎥 Video</option>
            </select>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" placeholder="Block heading" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Image/PDF/Video URL (optional) {uploading && <span style={{color: 'var(--blue-500)'}}> (Uploading...)</span>}</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <input type="file" className="form-input" accept="image/*, application/pdf, video/*" onChange={handleImageUpload} />
            <input className="form-input" placeholder="Or enter URL directly (e.g. from ImageKit)" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
        </div>

        {type === 'paragraph' && (
          <div className="form-group">
            <label className="form-label">Text</label>
            <textarea className="form-textarea" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        )}

        {type === 'table' && (
          <div className="form-group">
            <label className="form-label">Table Rows</label>
            {data.map((row: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input className="form-input" placeholder="Title" value={row.title} onChange={(e) => {
                  const n = [...data]; n[i] = { ...n[i], title: e.target.value }; setData(n);
                }} />
                <input className="form-input" placeholder="Link" value={row.link} onChange={(e) => {
                  const n = [...data]; n[i] = { ...n[i], link: e.target.value }; setData(n);
                }} />
                <button className="btn btn-danger btn-sm" onClick={() => setData(data.filter((_:any,idx:number)=>idx!==i))}>&times;</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => setData([...data, {title:'',link:''}])}>+ Row</button>
          </div>
        )}

        {type === 'qa' && (
          <div className="form-group">
            <label className="form-label">Questions & Answers</label>
            {data.map((item: any, i: number) => (
              <div key={i} style={{ background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <input className="form-input" placeholder="Question (e.g. CBSE Board Accounts Class 12)" value={item.question} onChange={(e) => {
                    const n = [...data]; n[i] = { ...n[i], question: e.target.value }; setData(n);
                  }} />
                  <button className="btn btn-danger btn-sm" onClick={() => setData(data.filter((_:any,idx:number)=>idx!==i))}>&times;</button>
                </div>
                
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.4rem' }}>Links:</div>
                {item.links.map((linkObj: any, li: number) => {
                  const isOld = typeof linkObj === 'string';
                  const title = isOld ? 'Link' : linkObj.title;
                  const url   = isOld ? linkObj : linkObj.url;

                  return (
                    <div key={li} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
                      <input className="form-input" placeholder="Title (e.g. Accounts Syllabus)" value={title} onChange={(e) => {
                        const n = [...data]; 
                        const ls = [...n[i].links]; 
                        ls[li] = { title: e.target.value, url: url }; 
                        n[i] = { ...n[i], links: ls }; 
                        setData(n);
                      }} style={{ flex: 1, fontSize: '0.8rem' }} />
                      <input className="form-input" placeholder="URL" value={url} onChange={(e) => {
                        const n = [...data]; 
                        const ls = [...n[i].links]; 
                        ls[li] = { title: title, url: e.target.value }; 
                        n[i] = { ...n[i], links: ls }; 
                        setData(n);
                      }} style={{ flex: 2, fontSize: '0.8rem' }} />
                      <button className="btn btn-danger btn-sm" onClick={() => {
                        const n = [...data]; 
                        const ls = n[i].links.filter((_:any,idx:number)=>idx!==li); 
                        n[i] = { ...n[i], links: ls }; 
                        setData(n);
                      }}>&times;</button>
                    </div>
                  );
                })}
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const n = [...data]; n[i] = { ...n[i], links: [...n[i].links, { title: '', url: '' }] }; setData(n);
                }}>+ Add Link</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => setData([...data, {question:'',links:[{title:'',url:''}]}])}>+ Add Q&amp;A Item</button>
          </div>
        )}

        {type === 'list' && (
          <div className="form-group">
            <label className="form-label">List Items</label>
            {data.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input className="form-input" placeholder="Text" value={item.text} onChange={(e) => {
                  const n = [...data]; n[i] = { ...n[i], text: e.target.value }; setData(n);
                }} />
                <input className="form-input" placeholder="Link (opt)" value={item.link} onChange={(e) => {
                  const n = [...data]; n[i] = { ...n[i], link: e.target.value }; setData(n);
                }} />
                <button className="btn btn-danger btn-sm" onClick={() => setData(data.filter((_:any,idx:number)=>idx!==i))}>&times;</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={() => setData([...data, {text:'',link:''}])}>+ Item</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
