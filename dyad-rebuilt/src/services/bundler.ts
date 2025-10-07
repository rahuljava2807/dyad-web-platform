import { getAllFiles } from './memoryFs';

export const bundle = async (): Promise<string> => {
  console.log('Requesting bundle from backend...');
  const files = getAllFiles();

  try {
    const response = await fetch('http://localhost:3001/bundle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Bundling failed on backend.');
    }

    const data = await response.json();
    return data.bundledCode;
  } catch (error) {
    console.error('Error fetching bundled code from backend:', error);
    return `console.error("Bundling failed: ${error.message}");`;
  }
};

