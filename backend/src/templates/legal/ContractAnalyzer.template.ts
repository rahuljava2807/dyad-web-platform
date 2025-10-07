import { Template } from '../types'

export const ContractAnalyzerTemplate: Template = {
  id: 'legal-contract-analyzer',
  name: 'Contract Analyzer',
  description: 'Legal contract analysis tool with key terms extraction',
  category: 'legal',
  tags: ['contract', 'legal', 'analysis', 'terms', 'obligations'],
  files: [
    {
      path: 'src/components/ContractAnalyzer.tsx',
      content: `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Search, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

interface ContractTerm {
  id: string
  type: 'obligation' | 'right' | 'clause' | 'deadline' | 'amount'
  text: string
  confidence: number
  highlighted: boolean
}

interface ContractAnalysis {
  terms: ContractTerm[]
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  keyDates: string[]
  monetaryAmounts: string[]
}

export function ContractAnalyzer() {
  const [contractText, setContractText] = useState('')
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const mockAnalysis: ContractAnalysis = {
    terms: [
      {
        id: '1',
        type: 'obligation',
        text: 'Party A shall deliver the software within 30 days',
        confidence: 95,
        highlighted: false
      },
      {
        id: '2',
        type: 'deadline',
        text: 'Payment due within 15 days of invoice',
        confidence: 90,
        highlighted: false
      },
      {
        id: '3',
        type: 'amount',
        text: 'Total contract value: $50,000',
        confidence: 98,
        highlighted: false
      },
      {
        id: '4',
        type: 'clause',
        text: 'Force majeure clause applies to natural disasters',
        confidence: 85,
        highlighted: false
      },
      {
        id: '5',
        type: 'right',
        text: 'Client has right to terminate with 30 days notice',
        confidence: 88,
        highlighted: false
      }
    ],
    summary: 'This contract contains standard commercial terms with moderate risk. Key obligations include software delivery and payment terms. The contract includes standard termination and force majeure provisions.',
    riskLevel: 'medium',
    keyDates: ['30 days (delivery)', '15 days (payment)', '30 days (termination notice)'],
    monetaryAmounts: ['$50,000 (total value)']
  }

  const handleAnalyze = async () => {
    if (!contractText.trim()) return
    
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'obligation': return 'bg-red-100 text-red-800 border-red-200'
      case 'right': return 'bg-green-100 text-green-800 border-green-200'
      case 'clause': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deadline': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'amount': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'obligation': return <AlertCircle className="w-4 h-4" />
      case 'right': return <CheckCircle className="w-4 h-4" />
      case 'deadline': return <Clock className="w-4 h-4" />
      case 'amount': return <DollarSign className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const filteredTerms = analysis?.terms.filter(term => 
    term.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Contract Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract key terms, obligations, and analyze contract risks with AI-powered legal analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contract Text
                </CardTitle>
                <CardDescription>
                  Paste your contract text below for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract">Contract Content</Label>
                  <Textarea
                    id="contract"
                    placeholder="Paste your contract text here..."
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={!contractText.trim() || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {analysis && (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <Badge className={analysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                                       analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-green-100 text-green-800'}>
                        {analysis.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{analysis.summary}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Key Dates</h4>
                        <ul className="text-xs space-y-1">
                          {analysis.keyDates.map((date, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {date}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Monetary Amounts</h4>
                        <ul className="text-xs space-y-1">
                          {analysis.monetaryAmounts.map((amount, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {amount}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle>Search Terms</CardTitle>
                    <div className="space-y-2">
                      <Label htmlFor="search">Filter terms</Label>
                      <Input
                        id="search"
                        placeholder="Search for specific terms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTerms.map((term) => (
                        <div key={term.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getTypeColor(term.type)}>
                              <span className="flex items-center gap-1">
                                {getTypeIcon(term.type)}
                                {term.type}
                              </span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {term.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{term.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}`,
      summary: 'Main contract analyzer component with AI-powered term extraction'
    },
    {
      path: 'src/App.tsx',
      content: `import { ContractAnalyzer } from './components/ContractAnalyzer'

export default function App() {
  return <ContractAnalyzer />
}`,
      summary: 'Main application component'
    },
    {
      path: 'package.json',
      content: `{
  "name": "contract-analyzer-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}`,
      summary: 'Project dependencies and configuration'
    }
  ],
  metadata: {
    industry: 'legal',
    complexity: 'medium',
    features: ['term-extraction', 'risk-analysis', 'search-filtering', 'ai-analysis'],
    technologies: ['react', 'typescript', 'tailwind', 'lucide-react']
  }
}
