import { useEffect, useCallback, useState } from 'react';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import frontmatter from '@bytemd/plugin-frontmatter';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import { message } from 'antd';
import { eventAPI } from '../services/api';

/**
 * ByteMD Markdown 编辑器组件
 * 字节跳动开源，轻量简洁，插件化架构
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '请输入内容...',
  height = 500,
  uploadImage,
}) {
  const [plugins] = useState(() => [
    gfm(),
    highlight(),
    frontmatter(),
    mediumZoom(),
  ]);

  // 图片上传处理
  const handleUploadImages = useCallback(
    async (files) => {
      const results = [];
      
      for (const file of files) {
        // 检查文件大小（1MB限制）
        if (file.size > 1024 * 1024) {
          message.error(`图片 ${file.name} 超过1MB限制，请压缩后重试`);
          continue;
        }

        try {
          const uploadFn = uploadImage || eventAPI.uploadEventImage;
          const resp = await uploadFn(file);
          const url = resp.data?.url;
          if (url) {
            results.push({
              url,
              alt: file.name,
              title: file.name,
            });
            message.success(`图片 ${file.name} 上传成功`);
          }
        } catch (e) {
          message.error(`图片 ${file.name} 上传失败`);
          console.error(e);
        }
      }
      
      return results;
    },
    [uploadImage]
  );

  return (
    <div className="bytemd-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <Editor
        value={value || ''}
        onChange={onChange}
        plugins={plugins}
        placeholder={placeholder}
        uploadImages={handleUploadImages}
        mode="split"
      />
      <style>{`
        .bytemd-wrapper {
          --bytemd-color: #374151;
          --bytemd-background: #fff;
          --bytemd-border-color: #e5e7eb;
          --bytemd-border-radius: 8px;
        }
        .bytemd-wrapper .bytemd {
          border: none;
          border-radius: 8px;
          height: ${height}px;
        }
        .bytemd-wrapper .bytemd-toolbar {
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .bytemd-wrapper .bytemd-editor,
        .bytemd-wrapper .bytemd-preview {
          flex: 1;
        }
        .bytemd-wrapper .bytemd-status {
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .bytemd-wrapper .CodeMirror {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace;
          font-size: 14px;
        }
        .bytemd-wrapper .bytemd-preview {
          padding: 16px;
          font-size: 14px;
          line-height: 1.8;
        }
        .bytemd-wrapper .bytemd-preview img {
          max-width: 100%;
          border-radius: 4px;
          margin: 16px auto;
          display: block;
        }
        .bytemd-wrapper .bytemd-preview h1,
        .bytemd-wrapper .bytemd-preview h2,
        .bytemd-wrapper .bytemd-preview h3 {
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .bytemd-wrapper .bytemd-preview p {
          margin-bottom: 12px;
        }
        .bytemd-wrapper .bytemd-preview ul,
        .bytemd-wrapper .bytemd-preview ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }
        .bytemd-wrapper .bytemd-preview pre {
          background: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
        }
        .bytemd-wrapper .bytemd-preview code {
          background: #f6f8fa;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
        }
        .bytemd-wrapper .bytemd-preview pre code {
          background: transparent;
          padding: 0;
        }
        .bytemd-wrapper .bytemd-preview blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 16px;
          color: #6b7280;
          margin: 16px 0;
        }
        .bytemd-wrapper .bytemd-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }
        .bytemd-wrapper .bytemd-preview th,
        .bytemd-wrapper .bytemd-preview td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        .bytemd-wrapper .bytemd-preview th {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
