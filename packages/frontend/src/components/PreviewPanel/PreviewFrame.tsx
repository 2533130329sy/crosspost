import { useCallback, useEffect, useRef, useState } from 'react';

interface PreviewFrameProps {
  html: string;
  platform: string;
}

export function PreviewFrame({ html, platform }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);
  const [loading, setLoading] = useState(true);

  const updateHeight = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument?.body) return;
      const h = iframe.contentDocument.body.scrollHeight;
      if (h > 0) setHeight(h + 20);
      setLoading(false);
    } catch {
      // Cross-origin restriction (shouldn't happen with srcdoc)
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    // Small delay to allow the iframe to render
    const timer = setTimeout(updateHeight, 300);
    return () => clearTimeout(timer);
  }, [html, updateHeight]);

  return (
    <div style={{ position: 'relative', minHeight: 200 }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 13,
            background: '#fafafa',
            zIndex: 1,
          }}
        >
          <span>正在渲染{platform}预览...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-same-origin"
        title={`${platform} preview`}
        onLoad={() => setTimeout(updateHeight, 200)}
        style={{
          width: '100%',
          height,
          border: 'none',
          display: 'block',
          transition: 'height 0.2s ease',
        }}
      />
    </div>
  );
}
