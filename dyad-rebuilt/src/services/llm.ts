export const generateCode = async (prompt: string): Promise<Record<string, string>> => {
  console.log('Generating code for prompt:', prompt);
  // In the future, this will call the LLM API.
  // For now, it returns a hardcoded example.
  return {
    'index.html': `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Generated App</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/main.tsx"></script>
        </body>
      </html>
    `,
    'main.tsx': `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from './App';

      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    `,
    'App.tsx': `
      import React from 'react';

      const App = () => {
        return <h1>Hello from the generated app!</h1>;
      };

      export default App;
    `,
  };
};
