'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function normalizeLanguage(language?: string) {
  const value = language?.trim() || 'Python3.9';
  const normalized = value.toLowerCase().replace(/\s+/g, '');
  const pythonMajorThree = `python${3}`;
  if (normalized === 'python' || normalized === pythonMajorThree || normalized === 'py') {
    return 'Python3.9';
  }
  return value;
}

export default function CodeBlock({ code, language = 'Python3.9' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const displayLanguage = normalizeLanguage(language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <div className="code-block-header flex items-center justify-between bg-slate-800 px-4 py-2">
        <span className="code-language">{displayLanguage}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="code-copy-button transition-colors hover:text-white"
        >
          {copied ? '已复制 ✓' : '复制代码'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-slate-950 p-4">
        <code>{code}</code>
      </pre>
    </div>
  );
}
