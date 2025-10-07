// This will hold the in-memory file system.
export const files: Record<string, string> = {};

export const setFile = (path: string, content: string) => {
  files[path] = content;
  console.log(`File written to memoryFs: ${path}`);
};

export const getFile = (path: string): string | undefined => {
  return files[path];
};

export const getAllFiles = (): Record<string, string> => {
  return { ...files };
};

export const clearFs = () => {
  for (const key in files) {
    delete files[key];
  }
  console.log('Memory FS cleared.');
};
