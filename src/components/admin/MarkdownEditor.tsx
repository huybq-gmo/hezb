'use client';

import ReactMarkdown from 'react-markdown';
import { useRef, useState } from 'react';

type MarkdownEditorProps = { id: string; label: string; value: string; onChange: (value: string) => void };

export function MarkdownEditor({ id, label, value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  function replaceSelection(before: string, after = before) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertLine(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextValue = `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`;
    onChange(nextValue);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, start + prefix.length); });
  }

  return <div className="markdown-editor">
    <div className="markdown-editor-heading"><label htmlFor={id}>{label}</label><div className="markdown-mode" role="group" aria-label={`${label} mode`}><button className={mode === 'write' ? 'active' : ''} type="button" onClick={() => setMode('write')}>Write</button><button className={mode === 'preview' ? 'active' : ''} type="button" onClick={() => setMode('preview')}>Preview</button></div></div>
    {mode === 'write' ? <>
      <div className="markdown-toolbar" aria-label="Formatting tools">
        <button type="button" onClick={() => replaceSelection('**')} aria-label="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => replaceSelection('*')} aria-label="Italic"><em>I</em></button>
        <button type="button" onClick={() => insertLine('## ')} aria-label="Heading">H2</button>
        <button type="button" onClick={() => insertLine('- ')} aria-label="Bullet list">•</button>
        <button type="button" onClick={() => replaceSelection('[', '](https://)')} aria-label="Link">Link</button>
        <button type="button" onClick={() => replaceSelection('![', '](https://)')} aria-label="Image">Image</button>
      </div>
      <textarea ref={textareaRef} id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={18} placeholder="Tell a clear story. Use headings, short paragraphs and examples." />
      <small className="field-hint">Markdown is supported. Use the preview to check hierarchy, links and images before publishing.</small>
    </> : <div className="markdown-preview prose"><ReactMarkdown skipHtml>{value || '*Nothing to preview yet.*'}</ReactMarkdown></div>}
  </div>;
}
