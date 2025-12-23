import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Separate CodeBlock component with copy functionality
function CodeBlock({ children, language }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      {language && (
        <div className="absolute top-0 left-0 px-2 py-1 text-xs text-muted-foreground bg-muted/80 rounded-br">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-muted/80 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <pre className="bg-muted/50 border border-border rounded-lg p-4 pt-8 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">{children}</code>
      </pre>
    </div>
  );
}

const components: Components = {
  // Code blocks with copy button
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !className;
    
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[0.85em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <CodeBlock language={match?.[1]}>
        {String(children).replace(/\n$/, '')}
      </CodeBlock>
    );
  },
  // Styled pre wrapper
  pre({ children }) {
    return <>{children}</>;
  },
  // Links open in new tab
  a({ href, children }) {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary hover:underline"
      >
        {children}
      </a>
    );
  },
  // Better list styling
  ul({ children }) {
    return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-foreground">{children}</li>;
  },
  // Headings
  h1({ children }) {
    return <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">{children}</h3>;
  },
  // Paragraphs
  p({ children }) {
    return <p className="my-2 leading-relaxed text-foreground">{children}</p>;
  },
  // Blockquotes
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-primary/50 pl-4 my-3 italic text-muted-foreground">
        {children}
      </blockquote>
    );
  },
  // Tables
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-border rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-muted">{children}</thead>;
  },
  th({ children }) {
    return (
      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground border-b border-border">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-3 py-2 text-sm text-foreground border-b border-border">
        {children}
      </td>
    );
  },
  // Horizontal rule
  hr() {
    return <hr className="my-4 border-border" />;
  },
  // Strong/Bold
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  // Emphasis/Italic
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
