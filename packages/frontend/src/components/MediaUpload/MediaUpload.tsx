import { useCallback, useRef, useState } from 'react';
import type { MediaAsset } from '@crosspost/shared';

interface MediaUploadProps {
  assets: MediaAsset[];
  onAssetsChange: (assets: MediaAsset[]) => void;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

function compressImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1080;
      let { width, height } = img;
      if (width <= maxW) {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result as string, width, height });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      const ratio = maxW / width;
      width = maxW;
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.8), width, height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUpload({ assets, onAssetsChange }: MediaUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      const newAssets: MediaAsset[] = [];

      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE) {
          setError(`文件 "${file.name}" 超过50MB限制`);
          continue;
        }

        const isImage = ALLOWED_IMAGE.includes(file.type);
        const isVideo = ALLOWED_VIDEO.includes(file.type);
        if (!isImage && !isVideo) {
          setError(`不支持的文件类型: ${file.type}`);
          continue;
        }

        if (isImage) {
          try {
            const { dataUrl, width, height } = await compressImage(file);
            newAssets.push({
              id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              type: 'image',
              dataUrl,
              fileName: file.name,
              fileSize: file.size,
              width,
              height,
            });
          } catch {
            setError(`图片处理失败: ${file.name}`);
          }
        } else {
          // Video: read as data URL without compression
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          newAssets.push({
            id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'video',
            dataUrl,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }

      if (newAssets.length > 0) {
        onAssetsChange([...assets, ...newAssets]);
      }
    },
    [assets, onAssetsChange],
  );

  const removeAsset = useCallback(
    (id: string) => {
      onAssetsChange(assets.filter((a) => a.id !== id));
    },
    [assets, onAssetsChange],
  );

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: 8,
          padding: '20px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#eff6ff' : '#fafafa',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <div style={{ fontSize: 24, marginBottom: 4 }}>&#128206;</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          拖拽图片/视频到此处，或点击上传
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          图片自动优化至1080px · 最大50MB
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            color: '#dc2626',
            fontSize: 12,
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 8,
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            x
          </button>
        </div>
      )}

      {/* Asset previews */}
      {assets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {assets.map((a) => (
            <div
              key={a.id}
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
              }}
            >
              {a.type === 'image' ? (
                <img
                  src={a.dataUrl}
                  alt={a.fileName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  &#127916;
                </div>
              )}
              {/* Quality badge */}
              {a.type === 'image' && (
                <div
                  title="为提升分发速度，已自动优化至1080px/80%质量，原文件保留"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(16,185,129,0.9)',
                    color: '#fff',
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 3,
                    cursor: 'help',
                  }}
                >
                  已优化
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(a.id);
                }}
                style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
