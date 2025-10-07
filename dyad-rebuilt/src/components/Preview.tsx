import React, { useEffect } from 'react';

interface PreviewProps {
  bundledCode: string;
}

export const Preview: React.FC<PreviewProps> = ({ bundledCode }) => {
  useEffect(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && bundledCode) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
        </head>
        <body>
            <div id="root"></div>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script>${bundledCode}</script> <!-- Removed type="module" -->
        </body>
        </html>
      `;
      iframe.srcdoc = htmlContent;
    }
  }, [bundledCode]);

  return (
    <iframe
      id="preview-iframe"
      title="Preview"
      sandbox="allow-scripts"
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
};
