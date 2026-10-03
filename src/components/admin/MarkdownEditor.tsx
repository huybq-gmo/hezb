'use client';

import ReactMarkdown from 'react-markdown';
import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';

type MarkdownEditorProps = { id: string; label: string; value: string; onChange: (value: string) => void; onUploadImage?: (file: File) => Promise<string> };

export function MarkdownEditor({ id, label, value, onChange, onUploadImage }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageSelectionRef = useRef({ start: 0, end: 0 });
  const valueRef = useRef(value);
  valueRef.current = value;
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState('');

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

  function openImagePicker() {
    const textarea = textareaRef.current;
    if (!textarea || !onUploadImage) return;
    imageSelectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    imageInputRef.current?.click();
  }

  async function insertUploadedImage(file: File) {
    if (!onUploadImage) return;
    setImageBusy(true); setImageError('');
    try {
      const url = await onUploadImage(file);
      const { start, end } = imageSelectionRef.current;
      const currentValue = valueRef.current;
      const safeStart = Math.min(start, currentValue.length);
      const safeEnd = Math.min(Math.max(end, safeStart), currentValue.length);
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/[\[\]]/g, '').trim() || 'Image';
      const markdown = `![${alt}](${url})`;
      const nextValue = `${currentValue.slice(0, safeStart)}${markdown}${currentValue.slice(safeEnd)}`;
      valueRef.current = nextValue;
      onChange(nextValue);
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        const cursor = safeStart + markdown.length;
        textarea.setSelectionRange(cursor, cursor);
      });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Unable to upload this image.');
    } finally { setImageBusy(false); }
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
        <button type="button" onClick={openImagePicker} disabled={!onUploadImage || imageBusy} aria-label="Upload and insert image" title="Upload and insert image"><ImagePlus size={15} /><span className="sr-only">Image</span></button>
      </div>
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void insertUploadedImage(file); event.currentTarget.value = ''; }} />
      <textarea ref={textareaRef} id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={18} placeholder="Tell a clear story. Use headings, short paragraphs and examples." />
      {imageError ? <p className="field-error" role="alert">{imageError}</p> : null}
      {imageBusy ? <small className="field-hint">Optimizing and uploading image...</small> : null}
      <small className="field-hint">Markdown is supported. Use the preview to check hierarchy, links and images before publishing.</small>
    </> : <div className="markdown-preview prose"><ReactMarkdown skipHtml>{value || '*Nothing to preview yet.*'}</ReactMarkdown></div>}
  </div>;
}
