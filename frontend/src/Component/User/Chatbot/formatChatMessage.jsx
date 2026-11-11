import React from 'react';

/** Inline: **bold**, *italic*, `code` → React nodes (no HTML injection). */
function formatInline(text, keyPrefix) {
  if (!text) return null;
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-b-${i++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={`${keyPrefix}-i-${i++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={`${keyPrefix}-c-${i++}`}>{token.slice(1, -1)}</code>);
    } else {
      parts.push(token);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

/**
 * Renders AI chat text with light Markdown support:
 * paragraphs, bullets, numbe lists, bold/italic.
 */
export default function FormatChatMessage({ text }) {
  if (!text) return null;

  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let listType = null; // 'ul' | 'ol'
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    blocks.push(
      <Tag key={`list-${blocks.length}`} className="ls-chat-list">
        {listItems.map((item, idx) => (
          <li key={idx}>{formatInline(item, `li-${blocks.length}-${idx}`)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
    const numbe = line.match(/^\s*\d+[.)]\s+(.+)$/);

    if (bullet) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bullet[1]);
      return;
    }
    if (numbe) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(numbe[1]);
      return;
    }

    flushList();
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push(<div key={`sp-${blocks.length}`} className="ls-chat-spacer" />);
      return;
    }
    blocks.push(
      <p key={`p-${blocks.length}`} className="ls-chat-p">
        {formatInline(trimmed, `p-${blocks.length}`)}
      </p>
    );
  });

  flushList();
  return <div className="ls-chat-md">{blocks}</div>;
}
