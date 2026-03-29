'use client';

import { useState } from 'react';

interface NavLink { _id: string; slug: string; label: string; midLinks: MidLink[]; }
interface MidLink { _id: string; slug: string; label: string; subLinks: SubLink[]; }
interface SubLink { _id: string; slug: string; label: string; }

interface Props {
  navLinks: NavLink[];
  onRefresh: () => void;
}

export default function NavLinkManager({ navLinks, onRefresh }: Props) {
  const [showAddNav, setShowAddNav]   = useState(false);
  const [showAddMid, setShowAddMid]   = useState<string | null>(null);
  const [showAddSub, setShowAddSub]   = useState<string | null>(null); // "navId:midId"
  const [form, setForm]               = useState({ slug: '', label: '' });
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState('');

  const resetForm = () => setForm({ slug: '', label: '' });
  const flash     = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // ── Add NavLink ──
  async function addNavLink() {
    setLoading(true);
    const res = await fetch('/api/admin/navlinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { flash('Nav link added!'); resetForm(); setShowAddNav(false); onRefresh(); }
    else { const d = await res.json(); flash(`Error: ${d.error}`); }
  }

  // ── Delete NavLink ──
  async function deleteNavLink(id: string) {
    if (!confirm('Delete this nav link and all its sub-sections?')) return;
    await fetch(`/api/admin/navlinks/${id}`, { method: 'DELETE' });
    flash('Deleted'); onRefresh();
  }

  // ── Add MidLink ──
  async function addMidLink(navId: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/navlinks/${navId}/midlinks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { flash('Mid-link added!'); resetForm(); setShowAddMid(null); onRefresh(); }
    else { const d = await res.json(); flash(`Error: ${d.error}`); }
  }

  // ── Delete MidLink ──
  async function deleteMidLink(navId: string, midId: string) {
    if (!confirm('Delete this section?')) return;
    await fetch(`/api/admin/navlinks/${navId}/midlinks/${midId}`, { method: 'DELETE' });
    flash('Deleted'); onRefresh();
  }

  // ── Add SubLink ──
  async function addSubLink(navId: string, midId: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/navlinks/${navId}/midlinks/${midId}/sublinks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { flash('Sub-link added!'); resetForm(); setShowAddSub(null); onRefresh(); }
    else { const d = await res.json(); flash(`Error: ${d.error}`); }
  }

  // ── Delete SubLink ──
  async function deleteSubLink(navId: string, midId: string, subId: string) {
    if (!confirm('Delete this topic?')) return;
    await fetch(`/api/admin/navlinks/${navId}/midlinks/${midId}/sublinks/${subId}`, { method: 'DELETE' });
    flash('Deleted'); onRefresh();
  }

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">🔗 Navigation Manager</h2>
        <button className="btn btn-primary" onClick={() => { setShowAddNav(true); resetForm(); }}>
          + Add Nav Link
        </button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {/* Add NavLink Modal */}
      {showAddNav && (
        <AddModal
          title="Add Nav Link"
          form={form}
          setForm={setForm}
          loading={loading}
          onClose={() => setShowAddNav(false)}
          onSubmit={addNavLink}
          hint="e.g. slug: 'jee', label: 'JEE'"
        />
      )}

      {/* Add MidLink Modal */}
      {showAddMid && (
        <AddModal
          title="Add Mid-Level Link"
          form={form}
          setForm={setForm}
          loading={loading}
          onClose={() => setShowAddMid(null)}
          onSubmit={() => addMidLink(showAddMid)}
          hint="e.g. slug: 'physics', label: 'Physics'"
        />
      )}

      {/* Add SubLink Modal */}
      {showAddSub && (
        <AddModal
          title="Add Sub-Level Link"
          form={form}
          setForm={setForm}
          loading={loading}
          onClose={() => setShowAddSub(null)}
          onSubmit={() => { const [navId, midId] = showAddSub.split(':'); addSubLink(navId, midId); }}
          hint="e.g. slug: 'notes', label: 'Chapter Notes'"
        />
      )}

      {/* Nav links tree */}
      {navLinks.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
          <p>No nav links yet. Click &quot;+ Add Nav Link&quot; to create one.</p>
        </div>
      ) : (
        navLinks.map((nl) => (
          <div key={nl._id} className="block-card">
            {/* NavLink row */}
            <div className="block-card__header">
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--blue-700)' }}>{nl.label}</span>
                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>/{nl.slug}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowAddMid(nl._id); resetForm(); }}>
                  + Add Sub-section
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteNavLink(nl._id)}>Delete</button>
              </div>
            </div>

            {/* MidLinks */}
            {nl.midLinks.length > 0 ? (
              <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--blue-100)' }}>
                {nl.midLinks.map((ml) => (
                  <div key={ml._id} style={{ marginBottom: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{ml.label}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--gray-400)' }}>/{ml.slug}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setShowAddSub(`${nl._id}:${ml._id}`); resetForm(); }}>
                          + Topic
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMidLink(nl._id, ml._id)}>&times;</button>
                      </div>
                    </div>

                    {/* SubLinks */}
                    {ml.subLinks.length > 0 && (
                      <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--blue-200)' }}>
                        {ml.subLinks.map((sl) => (
                          <div key={sl._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--gray-700)' }}>└ {sl.label} <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>/{sl.slug}</span></span>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteSubLink(nl._id, ml._id, sl._id)}>&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ paddingLeft: '1.5rem', color: 'var(--gray-400)', fontSize: '0.85rem' }}>No sub-sections. Click &quot;+ Add Sub-section&quot;.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ── Reusable mini-modal ────────────────────────────────────────────── */
function AddModal({ title, form, setForm, loading, onClose, onSubmit, hint }: {
  title: string;
  form: { slug: string; label: string };
  setForm: (f: { slug: string; label: string }) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  hint?: string;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="form-group">
          <label className="form-label">Label (display name)</label>
          <input className="form-input" placeholder="e.g. JEE" value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Slug (URL-safe, no spaces)</label>
          <input className="form-input" placeholder="e.g. jee" value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
          {hint && <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{hint}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={loading || !form.slug || !form.label}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
