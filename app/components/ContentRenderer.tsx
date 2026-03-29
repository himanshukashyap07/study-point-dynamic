"use client";

import React from 'react';

export interface ContentBlock {
  _id?: string;
  type: 'table' | 'qa' | 'list' | 'paragraph' | 'image' | 'pdf' | 'video';
  title?: string;
  description?: string;
  image?: string;
  data?: unknown;
  text?: string;
}

interface TableRow { title: string; description: string; link: string; }
interface QALink { url: string; description?: string; title?: string; }
interface QAItem { question: string; links: (string | QALink)[]; }
interface ListItem { text: string; description?: string; link?: string; }

interface Props { blocks: ContentBlock[]; }

/* ── Media type detection ─────────────────────────────────────────────── */
type MediaKind = 'youtube' | 'image' | 'pdf' | 'link';

function getMediaType(url: string): MediaKind {
  if (!url) return 'link';
  const u = url.toLowerCase();
  // YouTube
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/') || u.includes('youtube.com/embed')) return 'youtube';
  // Image extensions or Google Drive image preview
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)(\?|$)/.test(u)) return 'image';
  if (u.includes('drive.google.com') && (u.includes('?id=') || u.includes('/d/'))) {
    // Drive links can be images or PDFs — treat as link so user decides
    return 'link';
  }
  if (/\.(pdf)(\?|$)/.test(u)) return 'pdf';
  return 'link';
}

function toYouTubeEmbed(url: string): string {
  // https://www.youtube.com/watch?v=ID  →  https://www.youtube.com/embed/ID
  // https://youtu.be/ID                →  https://www.youtube.com/embed/ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch  = url.match(/[?&]v=([^&]+)/);
  if (longMatch)  return `https://www.youtube.com/embed/${longMatch[1]}`;
  // Already an embed URL
  if (url.includes('/embed/')) return url;
  return url;
}

function getAttachmentLabel(url: string | undefined): string {
  if (!url) return 'View Media';
  const kind = getMediaType(url);
  if (kind === 'youtube') return 'Watch Video';
  if (kind === 'pdf') return 'View PDF';
  if (url.includes('drive.google.com')) return 'View on Drive';
  
  const lastPart = url.split('/').pop()?.split('?')[0];
  if (lastPart && lastPart.includes('.')) return lastPart;
  
  if (kind === 'image') return 'View Image';
  return 'Open Link';
}

/* ── Universal media renderer ─────────────────────────────────────────── */
function MediaLink({ url, label }: { url: string; label?: string }) {
  if (!url) return null;
  const kind = getMediaType(url);

  if (kind === 'youtube') {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
        <iframe
          src={toYouTubeEmbed(url)}
          title={label || 'YouTube video'}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }

  if (kind === 'image') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label || 'Image'} style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-md)', display: 'block', marginTop: '0.5rem' }} />
      </div>
    );
  }

  // PDF or generic link — "Click here" hyperlink
  return (
    <a href={url} target="_blank" rel="noreferrer" className="content-link">
      {label || 'Click here'}
    </a>
  );
}

/* ── Social Share Component ─────────────────────────────────────────── */
function SocialShare() {
  return (
    <div className="social-share">
      <button className="social-share-btn" title="Share on Facebook"><SvgFacebook /></button>
      <button className="social-share-btn" title="Share on Twitter"><SvgTwitter /></button>
      <button className="social-share-btn" title="Share on WhatsApp"><SvgWhatsapp /></button>
      <button className="social-share-btn" title="Share on Telegram"><SvgTelegram /></button>
    </div>
  );
}

function SvgFacebook()  { return <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"/></svg>; }
function SvgTwitter()   { return <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.985l4.274 5.657zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function SvgWhatsapp()  { return <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>; }
function SvgTelegram()  { return <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0zm5.833 8.333l-2.083 9.792c-.139.625-.521.764-1.042.486L11.528 16.25l-1.597 1.528c-.174.174-.32.32-.66.32l.236-3.375L15.625 9.167c.236-.208-.052-.32-.361-.111l-7.597 4.778-3.264-1.028c-.708-.222-.722-.708.153-1.055l12.778-4.931c.597-.222 1.111.139.643 1.542z"/></svg>; }

/* ── Main renderer ────────────────────────────────────────────────────── */
export default function ContentRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="content-card" style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '4rem' }}>
        <p>No content has been added to this section yet.</p>
      </div>
    );
  }

  return (
    <div className="content-renderer">
      <SocialShare />
      {blocks.map((block, idx) => {
        const isParagraphWithImage = block.type === 'paragraph' && !!block.image;
        const showGlobalAttachment = !!block.image && !['paragraph', 'image', 'pdf', 'video'].includes(block.type);
        return (
          <div key={block._id || idx} className="content-block">
            {block.title && !isParagraphWithImage && <h3 className="content-block__title">{block.title}</h3>}
            <BlockContent block={block} />
            
            {showGlobalAttachment && (
              <div className="paragraph-attachment" style={{ marginTop: '1.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                   <span style={{ fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                     {block.title || 'Attached Media'}
                   </span>
                   <a href={block.image} target="_blank" rel="noreferrer" className="content-link" style={{ fontWeight: 500, padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)', textDecoration: 'none', fontSize: '1.05rem' }}>
                     {getAttachmentLabel(block.image)}
                   </a>
                 </div>
              </div>
            )}

            {block.description && !isParagraphWithImage && <p className="content-block__description" style={{ marginTop: '1rem' }}>{block.description}</p>}
          </div>
        );
      })}
    </div>
  );
}

function BlockContent({ block }: { block: ContentBlock }) {
  switch (block.type) {

    case 'table': {
      const rows = (block.data as TableRow[]) || [];
      return (
        <div className="premium-table-wrap">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '80px', color: '#dc2626', textAlign: 'center' }}>S.N.</th>
                <th style={{ width: '40%', color: '#dc2626' }}>Topic / Resource</th>
                <th style={{ color: '#dc2626' }}>Link / Information</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} style={{ color: 'var(--gray-400)', textAlign: 'center' }}>No rows yet.</td></tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', color: 'var(--gray-600)' }}>{i + 1}.</td>
                    <td>{row.title}</td>
                    <td>
                      {row.description && <span style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--gray-700)' }}>{row.description}</span>}
                      {row.link ? (
                        <a href={row.link} target="_blank" rel="noreferrer" className="content-link">
                          Click Here
                        </a>
                      ) : null}
                      {!row.description && !row.link && '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }

    case 'qa': {
      const items = (block.data as QAItem[]) || [];
      return (
        <div className="premium-qa-list">
          {items.map((item, i) => (
            <div key={i} className="premium-qa-item-new">
              <div className="premium-section-title">
                {item.question}
              </div>
              <div className="premium-links-grid">
                {(item.links || []).filter(Boolean).map((linkData: any, li: number) => {
                  const isOld = typeof linkData === 'string';
                  const url   = isOld ? linkData : linkData.url;
                  const desc  = isOld ? '' : linkData.description;
                  const title = isOld ? '' : (linkData.title || '');

                  if (!url && !desc) return null;

                  return (
                    <div key={li} className="premium-link-item">
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="commerce-link">
                          {title || desc || "Click Here"}
                        </a>
                      ) : (
                        <span className="commerce-text">{desc}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: 'var(--gray-400)', padding: '1rem' }}>No items added yet.</p>}
        </div>
      );
    }

    case 'list': {
      const items = (block.data as ListItem[]) || [];
      return (
        <div className="premium-list-v2">
          <div className="premium-links-grid">
            {items.map((item, idx) => (
              <div key={idx} className="premium-link-item">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer" className="commerce-link">
                    {item.text} {item.description ? `- ${item.description}` : ''}
                  </a>
                ) : (
                  <span className="commerce-text">
                    {item.text} {item.description ? `: ${item.description}` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
          {items.length === 0 && <p style={{ color: 'var(--gray-400)' }}>No items added yet.</p>}
        </div>
      );
    }

    case 'paragraph': {
      return (
        <div className="content-paragraph-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {block.image && (
            <div className="paragraph-attachment" style={{  }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                 <span style={{ fontWeight: 600, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                   {block.title || 'Attachment'}
                 </span>
                 <a href={block.image} target="_blank" rel="noreferrer" className="content-link" style={{ fontWeight: 500, padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)', textDecoration: 'none', fontSize: '1.05rem' }}>
                   {getAttachmentLabel(block.image)}
                 </a>
               </div>
            </div>
          )}
          {block.text && (
            <p className="content-paragraph" style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap', 
              fontSize: block.image ? '1.15rem' : undefined,
              marginTop: block.image ? '0.25rem' : '0'
            }}>
              {block.text}
            </p>
          )}
        </div>
      );
    }

    case 'image': {
      const url = block.image || '';
      if (!url) return null;

      // Keep YouTube embeds for type=image for backward compatibility (custom URLs)
      if (getMediaType(url) === 'youtube') {
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
            <iframe
              src={toYouTubeEmbed(url)}
              title={block.title || 'Video'}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        );
      }

      // Always attempt to render block images directly (improved robustness for unknown extensions)
      const isImageUrl = /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(url);
      const canDisplayImage = isImageUrl || getMediaType(url) === 'image';

      if (canDisplayImage || url) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={block.title || 'Image'}
              style={{ maxWidth: '100%', maxHeight: '800px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', display: 'block', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                // Show fallback link if image fails
                if (target.parentElement) {
                  const fallback = document.createElement('a');
                  fallback.href = url;
                  fallback.target = '_blank';
                  fallback.className = 'content-link';
                  fallback.innerText = 'Open media';
                  target.parentElement.appendChild(fallback);
                }
              }}
            />
          </div>
        );
      }

      return (
        <div style={{ padding: '1rem 0' }}>
          <a href={url} target="_blank" rel="noreferrer" className="content-link">
            Open media
          </a>
        </div>
      );
    }

    case 'video': {
      const url = block.image || '';
      if (!url) return null;
      return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--gray-50)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🎥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{block.title || 'Video Content'}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{getAttachmentLabel(url)}</div>
          </div>
          <a href={`/showVideo?url=${encodeURIComponent(url)}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none' }}>
            Watch
          </a>
        </div>
      );
    }

    case 'pdf': {
      const url = block.image || '';
      if (!url) return null;
      return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--gray-50)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{block.title || 'PDF Document'}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{getAttachmentLabel(url)}</div>
          </div>
          <a href={`/showpdf?url=${encodeURIComponent(url)}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Open PDF
          </a>
        </div>
      );
    }

    default:
      return null;
  }
}
