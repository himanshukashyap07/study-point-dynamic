'use client';

import { useState, useEffect, useCallback } from 'react';

interface ContentBlock {
  _id?: string;
  type: 'table' | 'qa' | 'list' | 'paragraph' | 'image' | 'pdf' | 'video';
  title?: string;
  description?: string;
  image?: string;
  data?: unknown;
  text?: string;
}

interface Props {
  pageSlug: string;
  title: string;
}

type BlockType = 'table' | 'qa' | 'list' | 'paragraph' | 'image' | 'pdf' | 'video';

// Default data shapes per type
const defaultData: Record<BlockType, unknown> = {
  table: [{ title: '', description: '', link: '' }],
  qa: [{ question: '', links: [{ url: '', description: '' }] }],
  list: [{ text: '', description: '', link: '' }],
  paragraph: '',
  image: '',
  pdf: '',
  video: ''
};

export default function ContentEditor({ pageSlug, title }: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/content/${pageSlug}`);
    const json = await res.json();
    setBlocks(json.data?.blocks || []);
    setLoading(false);
  }, [pageSlug]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  async function saveBlock(block: ContentBlock) {
    const isNew = !block._id;
    const url = isNew
      ? `/api/admin/content/${pageSlug}`
      : `/api/admin/content/${pageSlug}/${block._id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(block) });
    if (res.ok) { flash(isNew ? 'Block added!' : 'Block updated!'); setShowAdd(false); setEditBlock(null); fetchBlocks(); }
    else { 
      try { const d = await res.json(); flash(`Error: ${d.error || 'Server error'}`); } 
      catch (e) { flash(`Server crashed or returned invalid response.`); }
    }
  }

  async function deleteBlock(blockId: string) {
    if (!confirm('Delete this content block?')) return;
    const res = await fetch(`/api/admin/content/${pageSlug}/${blockId}`, { method: 'DELETE' });
    if (res.ok) { flash('Deleted!'); fetchBlocks(); }
  }

  return (
    <div className="admin-content-inner">
      <div className="admin-content__header">
        <h2 className="admin-content__title">{title}</h2>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditBlock(null); }}>
          + Add Content Block
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {(showAdd || editBlock) && (
        <BlockForm
          initial={editBlock}
          onClose={() => { setShowAdd(false); setEditBlock(null); }}
          onSave={saveBlock}
        />
      )}

      {loading ? (
        <p style={{ color: 'var(--gray-400)', padding: '2rem' }}>Loading…</p>
      ) : blocks.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p>No content blocks yet. Click &quot;+ Add Content Block&quot; to start.</p>
        </div>
      ) : (
        <div className="admin-blocks-list">
          {blocks.map((block) => (
            <div key={block._id} className="block-card">
              <div className="block-card__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={`block-type-badge ${block.type}`}>{block.type}</span>
                  <span style={{ fontWeight: 600 }}>{block.title || '(no title)'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditBlock(block); setShowAdd(false); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteBlock(block._id!)}>Delete</button>
                </div>
              </div>
              <BlockPreview block={block} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Block form (add / edit) ─────────────────────────────────────────── */
function BlockForm({ initial, onClose, onSave }: {
  initial: ContentBlock | null;
  onClose: () => void;
  onSave: (b: ContentBlock) => void;
}) {
  const [type, setType] = useState<BlockType>(initial?.type || 'paragraph');
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [image, setImage] = useState(initial?.image || '');
  const [text, setText] = useState(initial?.text || '');
  const [data, setData] = useState<unknown>(initial?.data || defaultData[initial?.type || 'paragraph']);

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

  // Reset data when type changes (for new blocks)
  const handleTypeChange = (t: BlockType) => {
    setType(t);
    if (!initial) setData(defaultData[t]);
  };

  function buildBlock(): ContentBlock {
    const base = { _id: initial?._id, type, title, description, image };
    if (type === 'paragraph') return { ...base, text };
    return { ...base, data };
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal__header">
          <span className="modal__title">{initial ? 'Edit Block' : 'Add Content Block'}</span>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal__body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* Type selector */}
          <div className="form-group">
            <label className="form-label">Block Type</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['table', 'qa', 'list', 'paragraph', 'image', 'pdf', 'video'] as BlockType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'table' ? '📊 Table' : t === 'qa' ? '❓ Q&A' : t === 'list' ? '📋 List' : t === 'paragraph' ? '📝 Paragraph' : t === 'image' ? '🖼️ Image' : t === 'pdf' ? '📄 PDF' : '🎥 Video'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title (optional)</label>
            <input className="form-input" placeholder="Block heading" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>



          <div className="form-group">
            <label className="form-label">Image/PDF/Video URL {uploading && <span style={{color: 'var(--blue-500)'}}> (Uploading...)</span>}</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <input type="file" className="form-input" accept="image/*, application/pdf, video/*" onChange={handleImageUpload} />
              <input className="form-input" placeholder="Or enter URL directly (e.g. from ImageKit)" value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
          </div>

          {/* Type-specific fields */}
          {type === 'paragraph' && (
            <div className="form-group">
              <label className="form-label">Paragraph Text</label>
              <textarea className="form-textarea" rows={5} placeholder="Enter your paragraph…" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          )}
          {type === 'table' && <TableEditor rows={data as any[]} onChange={setData} />}
          {type === 'qa' && <QAEditor items={data as any[]} onChange={setData} />}
          {type === 'list' && <ListEditor items={data as any[]} onChange={setData} />}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(buildBlock())}>Save Block</button>
        </div>
      </div>
    </div>
  );
}

/* ── Table editor ─────────────────────────────────────────────────────── */
function TableEditor({ rows, onChange }: { rows: { title: string; description: string; link: string }[]; onChange: (d: unknown) => void }) {
  const update = (i: number, field: string, val: string) => {
    const next = [...rows]; next[i] = { ...next[i], [field]: val }; onChange(next);
  };
  const add = () => onChange([...rows, { title: '', description: '', link: '' }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      <label className="form-label">Table Rows</label>
      {rows.map((row, i) => (
        <div key={i} style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="form-input" placeholder="Title" value={row.title} onChange={(e) => update(i, 'title', e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>&times;</button>
          </div>
          <textarea className="form-textarea" placeholder="Description/Content" rows={2} value={row.description} onChange={(e) => update(i, 'description', e.target.value)} style={{ marginBottom: '0.5rem' }} />
          <input className="form-input" placeholder="PDF / Video link" value={row.link} onChange={(e) => update(i, 'link', e.target.value)} />
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: '0.25rem' }}>+ Row</button>
    </div>
  );
}

/* ── QA editor ────────────────────────────────────────────────────────── */
function QAEditor({ items, onChange }: { items: { question: string; links: any[] }[]; onChange: (d: unknown) => void }) {
  const updateQ = (i: number, q: string) => { const n = [...items]; n[i] = { ...n[i], question: q }; onChange(n); };
  const updateLink = (i: number, li: number, field: string, v: string) => {
    const n = [...items]; 
    const ls = [...n[i].links];
    const target = typeof ls[li] === 'string' ? { url: ls[li], description: '' } : ls[li];
    ls[li] = { ...target, [field]: v };
    n[i] = { ...n[i], links: ls }; 
    onChange(n); 
  };
  const addLink = (i: number) => { const n = [...items]; n[i] = { ...n[i], links: [...n[i].links, { url: '', description: '' }] }; onChange(n); };
  const removeLink = (i: number, li: number) => { const n = [...items]; n[i] = { ...n[i], links: n[i].links.filter((_: any, idx: number) => idx !== li) }; onChange(n); };
  const addItem = () => onChange([...items, { question: '', links: [{ url: '', description: '' }] }]);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      <label className="form-label">Q&amp;A Items</label>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input className="form-input" placeholder="Question / Heading" value={item.question} onChange={(e) => updateQ(i, e.target.value)} style={{ flex: 1, fontWeight: 'bold' }} />
            <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>&times;</button>
          </div>
          
          <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--blue-200)' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Answers / Links</label>
            {item.links.map((link, li) => {
              const url = typeof link === 'string' ? link : link.url;
              const desc = typeof link === 'string' ? '' : link.description;
              return (
                <div key={li} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'white', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input className="form-input" placeholder="Description (e.g. Syllabus 2024)" value={desc} onChange={(e) => updateLink(i, li, 'description', e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-danger btn-sm" onClick={() => removeLink(i, li)}>&times;</button>
                  </div>
                  <input className="form-input" placeholder="Link URL" value={url} onChange={(e) => updateLink(i, li, 'url', e.target.value)} style={{ fontSize: '0.8rem' }} />
                </div>
              );
            })}
            <button className="btn btn-outline btn-sm" onClick={() => addLink(i)}>+ Add Answer/Link</button>
          </div>
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={addItem}>+ Add Q&amp;A Section</button>
    </div>
  );
}

/* ── List editor ──────────────────────────────────────────────────────── */
function ListEditor({ items, onChange }: { items: { text: string; description: string; link: string }[]; onChange: (d: unknown) => void }) {
  const update = (i: number, field: string, val: string) => {
    const next = [...items]; next[i] = { ...next[i], [field]: val }; onChange(next);
  };
  const add = () => onChange([...items, { text: '', description: '', link: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="form-group">
      <label className="form-label">List Items</label>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="form-input" placeholder="Item Title" value={item.text} onChange={(e) => update(i, 'text', e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>&times;</button>
          </div>
          <textarea className="form-textarea" placeholder="Description" rows={2} value={item.description} onChange={(e) => update(i, 'description', e.target.value)} style={{ marginBottom: '0.5rem' }} />
          <input className="form-input" placeholder="Link (optional)" value={item.link} onChange={(e) => update(i, 'link', e.target.value)} />
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={add} style={{ marginTop: '0.25rem' }}>+ Item</button>
    </div>
  );
}

/* ── Block preview ────────────────────────────────────────────────────── */
function BlockPreview({ block }: { block: ContentBlock }) {
  if (block.type === 'paragraph') return <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{block.text?.slice(0, 120)}{(block.text?.length || 0) > 120 ? '…' : ''}</p>;
  if (block.type === 'table') {
    const rows = (block.data as { title: string; link: string }[]) || [];
    return <p style={{ color: 'var(--gray-500)', fontSize: '0.825rem' }}>{rows.length} row{rows.length !== 1 ? 's' : ''}</p>;
  }
  if (block.type === 'qa') {
    const items = (block.data as { question: string }[]) || [];
    return <p style={{ color: 'var(--gray-500)', fontSize: '0.825rem' }}>{items.length} Q&amp;A item{items.length !== 1 ? 's' : ''}</p>;
  }
  if (block.type === 'list') {
    const items = (block.data as { text: string }[]) || [];
    return <p style={{ color: 'var(--gray-500)', fontSize: '0.825rem' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>;
  }
  return null;
}
