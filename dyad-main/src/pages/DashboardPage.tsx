import React from 'react';
import Dashboard from '../components/Dashboard';
import { ThinkingPanel } from '../components/ThinkingPanel';

const sampleAIResponse = `
<think>
• **Identify the user's request**
  - The user wants to see a dashboard with some key metrics.
  - This will involve creating a new page and a new component.

• **Plan the implementation**
  - Create a Dashboard component with some cards for metrics.
  - Create a DashboardPage to host the component.
  - Add a route for the new page in router.ts.
  - Add a link to the new page in the sidebar.
</think>

Here is the dashboard you requested.
`;

const DashboardPage = () => {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Dashboard />
      <ThinkingPanel aiResponse={sampleAIResponse} />
    </div>
  );
};

export default DashboardPage;