import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, Clock, DollarSign, FileText, Users } from 'lucide-react';
import { YaviConnectorService } from '../../services/YaviConnector';

interface Milestone {
  name: string;
  date: string;
  status: string;
  completed: boolean;
  cost: number;
}

interface ProjectData {
  completion: number;
  budgetUsed: number;
  totalBudget: number;
  budgetRemaining: number;
  documentCount: number;
  pendingApprovals: number;
  milestones: Milestone[];
  recentDocuments: Array<{ name: string; type: string; date: string }>;
}

export const ProjectDashboard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const yaviConnector = new YaviConnectorService();

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // Connect to construction namespace
      const namespace = await yaviConnector.connectToNamespace('construction-projects');

      // Query project documents
      const documents = await yaviConnector.queryDocuments(
        namespace.id,
        `project:${projectId}`,
        50
      );

      // Process blueprints, permits, invoices
      const processedData = await yaviConnector.processDocument(
        new File([], 'project-data'),
        namespace.id,
        ['milestones', 'budget', 'timeline', 'safety', 'permits']
      );

      setProjectData(processedData as ProjectData);
    } catch (error) {
      console.error('Project data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading project data from Yavi.ai...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Construction Project Dashboard</h2>
        <p className="opacity-90">Real-time project insights powered by Yavi.ai</p>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-600">Timeline</span>
          </div>
          <div className="text-2xl font-bold">{projectData?.completion}%</div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${projectData?.completion}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-600">Budget</span>
          </div>
          <div className="text-2xl font-bold">
            ${projectData?.budgetUsed?.toLocaleString()} / ${projectData?.totalBudget?.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {projectData?.budgetRemaining}% remaining
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-gray-600">Documents</span>
          </div>
          <div className="text-2xl font-bold">{projectData?.documentCount}</div>
          <p className="text-sm text-gray-600 mt-2">
            {projectData?.pendingApprovals} pending approval
          </p>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
        <div className="space-y-4">
          {projectData?.milestones?.map((milestone: Milestone, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${
                milestone.completed ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <div className="font-medium">{milestone.name}</div>
                <div className="text-sm text-gray-600">
                  {milestone.date} - {milestone.status}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${milestone.cost?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
        <div className="space-y-2">
          {projectData?.recentDocuments?.map((doc, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-sm text-gray-600">{doc.type}</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
