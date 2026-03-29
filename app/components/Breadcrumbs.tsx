"use client";

import React from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <ul className="article-breadcrumbs">
      <li key="home"><a href="/">Home</a></li>
      {items.map((item, idx) => (
        <li key={idx}>
          <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>/</span>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
