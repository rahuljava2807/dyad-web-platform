import React, { useState } from 'react';
import { PromptInput } from './components/PromptInput';
import { Preview } from './components/Preview';
import { setFile, clearFs } from './services/memoryFs';
import { bundle } from './services/bundler'; // Import bundle

function App() {
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [bundledCode, setBundledCode] = useState<string>(''); // New state for bundled code

  const handleGenerate = async (files: Record<string, string>) => { // Make handleGenerate async
    clearFs();
    for (const path in files) {
      setFile(path, files[path]);
    }
    setGeneratedFiles(files);
    console.log('Generated files in App and stored in memoryFs:', files);

    const code = await bundle(); // Bundle the files
    setBundledCode(code); // Update bundledCode state
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h1>Dyad Rebuilt</h1>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '1rem' }}>
          <PromptInput onGenerate={handleGenerate} />
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #ccc' }}>
          <Preview bundledCode={bundledCode} /> {/* Pass bundledCode to Preview */}
        </div>
      </div>
    </div>
  );
}

export default App;
