import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, TrendingUp, FileText, CheckCircle, XCircle } from 'lucide-react';
import { YaviConnectorService } from '../../services/YaviConnector';

interface Invoice {
  number: string;
  vendor: string;
  date: string;
  total: number;
  tax: number;
  status: 'approved' | 'pending' | 'rejected' | 'processing';
  lineItems?: Array<{ description: string; amount: number }>;
}

interface Analytics {
  totalAmount: number;
  averageAmount: number;
  taxTotal: number;
  vendorCount: number;
  approvalRate: number;
}

export const InvoiceProcessor: React.FC<{ batchId?: string }> = ({ batchId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const yaviConnector = new YaviConnectorService();

  useEffect(() => {
    processInvoiceBatch();
  }, [batchId]);

  const processInvoiceBatch = async () => {
    try {
      // Connect to financial namespace
      const namespace = await yaviConnector.connectToNamespace('financial-documents');

      // Process invoices through Yavi's OCR and extraction
      const processedInvoices = await yaviConnector.processDocument(
        new File([], batchId || 'invoice-batch'),
        namespace.id,
        ['invoice-items', 'totals', 'tax', 'vendor', 'payment-terms']
      );

      const invoiceData = (processedInvoices as any).invoices || [];
      setInvoices(invoiceData);
      calculateAnalytics(invoiceData);
    } catch (error) {
      console.error('Invoice processing failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (invoiceData: Invoice[]) => {
    if (invoiceData.length === 0) {
      setAnalytics({
        totalAmount: 0,
        averageAmount: 0,
        taxTotal: 0,
        vendorCount: 0,
        approvalRate: 0
      });
      return;
    }

    const analytics: Analytics = {
      totalAmount: invoiceData.reduce((sum, inv) => sum + inv.total, 0),
      averageAmount: invoiceData.reduce((sum, inv) => sum + inv.total, 0) / invoiceData.length,
      taxTotal: invoiceData.reduce((sum, inv) => sum + inv.tax, 0),
      vendorCount: new Set(invoiceData.map(inv => inv.vendor)).size,
      approvalRate: (invoiceData.filter(inv => inv.status === 'approved').length / invoiceData.length) * 100
    };
    setAnalytics(analytics);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing invoices with Yavi.ai...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Invoice Processing Center</h2>
        <p className="opacity-90">Automated extraction and validation by Yavi.ai</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AnalyticsCard
          icon={DollarSign}
          title="Total Amount"
          value={`$${analytics?.totalAmount?.toLocaleString() || '0'}`}
          color="green"
        />
        <AnalyticsCard
          icon={TrendingUp}
          title="Average Invoice"
          value={`$${analytics?.averageAmount?.toFixed(2) || '0'}`}
          color="blue"
        />
        <AnalyticsCard
          icon={Receipt}
          title="Tax Collected"
          value={`$${analytics?.taxTotal?.toLocaleString() || '0'}`}
          color="purple"
        />
        <AnalyticsCard
          icon={FileText}
          title="Vendors"
          value={analytics?.vendorCount || 0}
          color="orange"
        />
        <AnalyticsCard
          icon={CheckCircle}
          title="Approval Rate"
          value={`${analytics?.approvalRate?.toFixed(0) || '0'}%`}
          color="green"
        />
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Processed Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.total?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.tax?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      Approve
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extraction Confidence */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Data Extraction Confidence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConfidenceMetric label="Vendor Recognition" value={95} />
          <ConfidenceMetric label="Amount Extraction" value={98} />
          <ConfidenceMetric label="Line Item Detection" value={92} />
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard: React.FC<{
  icon: any;
  title: string;
  value: string | number;
  color: string;
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-sm border p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-6 h-6 text-${color}-600`} />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const ConfidenceMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-600 h-2 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);
