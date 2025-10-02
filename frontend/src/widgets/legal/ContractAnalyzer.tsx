import React, { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Calendar, Users, DollarSign } from 'lucide-react';
import { YaviConnectorService } from '../../services/YaviConnector';

interface ContractData {
  parties: Array<{ name: string; role: string }>;
  keyTerms: Array<{ term: string; value: string; risk: 'low' | 'medium' | 'high' }>;
  obligations: Array<{ party: string; obligation: string; deadline?: string }>;
  financials: Array<{ type: string; amount: number; currency: string }>;
  risks: Array<{ category: string; description: string; severity: string }>;
}

export const ContractAnalyzer: React.FC<{ documentId: string }> = ({ documentId }) => {
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const yaviConnector = new YaviConnectorService();

  useEffect(() => {
    analyzeContract();
  }, [documentId]);

  const analyzeContract = async () => {
    try {
      // Connect to Yavi.ai legal namespace
      const namespace = await yaviConnector.connectToNamespace('legal-contracts');

      // Process document through Yavi's RAG pipeline
      const analysis = await yaviConnector.processDocument(
        new File([], documentId),
        namespace.id,
        ['parties', 'terms', 'obligations', 'financials', 'risks']
      );

      setContractData(analysis as ContractData);
    } catch (error) {
      console.error('Contract analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Analyzing contract with Yavi.ai...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Contract Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Contract Analysis Dashboard</h2>
        <p className="opacity-90">Powered by Yavi.ai Legal Intelligence</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          title="Parties"
          value={contractData?.parties.length || 0}
          color="blue"
        />
        <MetricCard
          icon={FileText}
          title="Key Terms"
          value={contractData?.keyTerms.length || 0}
          color="green"
        />
        <MetricCard
          icon={AlertTriangle}
          title="Risk Items"
          value={contractData?.risks.filter(r => r.severity === 'high').length || 0}
          color="red"
        />
        <MetricCard
          icon={Calendar}
          title="Obligations"
          value={contractData?.obligations.length || 0}
          color="purple"
        />
      </div>

      {/* Parties Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Contract Parties
        </h3>
        <div className="space-y-2">
          {contractData?.parties.map((party, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{party.name}</span>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded">
                {party.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Risk Analysis
        </h3>
        <div className="space-y-3">
          {contractData?.risks.map((risk, idx) => (
            <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{risk.category}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold
                  ${risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                    risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'}`}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Terms */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Key Terms & Conditions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Term</th>
                <th className="text-left py-2">Value</th>
                <th className="text-left py-2">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {contractData?.keyTerms.map((term, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{term.term}</td>
                  <td className="py-2">{term.value}</td>
                  <td className="py-2">
                    <RiskBadge level={term.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<any> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <Icon className={`w-8 h-8 text-${color}-600`} />
      <span className="text-2xl font-bold">{value}</span>
    </div>
    <p className="text-sm text-gray-600 mt-2">{title}</p>
  </div>
);

const RiskBadge: React.FC<{ level: string }> = ({ level }) => (
  <span className={`px-2 py-1 rounded text-xs font-semibold
    ${level === 'high' ? 'bg-red-100 text-red-700' :
      level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'}`}>
    {level.toUpperCase()}
  </span>
);
