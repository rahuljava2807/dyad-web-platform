# Phase 4 Quick Start Guide

## 🚀 What's New in Phase 4

Phase 4 introduces **Industry Widgets** and **Deep Yavi.ai Integration** to Yavi Studio.

### Key Features
- ✅ 4 Industry-Specific Widget Libraries
- ✅ Real-time Document Processing with Yavi RAG
- ✅ Widget Showcase Dashboard
- ✅ Smart Code Generation
- ✅ Enhanced YaviConnector Service

## 📦 Widgets Available

### Legal Industry
**ContractAnalyzer** - Analyze contracts and extract key information
- Parties & Roles
- Risk Assessment
- Key Terms & Conditions
- Obligations Tracking
- Financial Summary

### Construction Industry
**ProjectDashboard** - Track construction projects in real-time
- Timeline Progress
- Budget Analytics
- Milestone Tracking
- Document Management

### Healthcare Industry
**PatientInsights** - AI-powered patient health monitoring
- Vital Signs Monitoring
- Risk Assessment
- Medication Management
- Medical Records

### Financial Industry
**InvoiceProcessor** - Automated invoice processing with OCR
- Invoice Analytics
- Batch Processing
- Data Extraction Confidence
- Status Tracking

## 🎯 How to Use Widgets

### Option 1: Widget Showcase (Recommended for Demo)
1. Navigate to Yavi Studio: `http://localhost:3000/dashboard/yavi-studio`
2. Click "Widget Library" button
3. Select an industry (Legal, Construction, Healthcare, Financial)
4. Click on any widget to see live preview
5. Toggle "View Code Example" to see integration code

### Option 2: In Your Own App
```tsx
import { DynamicWidget } from '@/widgets/WidgetRegistry';

function MyApp() {
  return (
    <DynamicWidget
      industry="legal"
      type="ContractAnalyzer"
      props={{ documentId: "doc-123" }}
    />
  );
}
```

### Option 3: Direct Import
```tsx
import { ContractAnalyzer } from '@/widgets/legal/ContractAnalyzer';

function MyApp() {
  return <ContractAnalyzer documentId="contract-123" />;
}
```

## 🔧 Setup Instructions

### 1. Install Dependencies (Already Done)
All dependencies are already installed. Widgets use:
- React 18.3+
- TypeScript 5+
- Tailwind CSS 3.4+
- lucide-react

### 2. Configure Environment Variables
Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_YAVI_API_ENDPOINT=https://api.yavi.ai
NEXT_PUBLIC_YAVI_API_KEY=your_yavi_api_key_here
```

### 3. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Widget Library
Open: `http://localhost:3000/dashboard/yavi-studio/widgets`

## 🏗️ File Structure

```
frontend/src/
├── widgets/
│   ├── legal/ContractAnalyzer.tsx
│   ├── construction/ProjectDashboard.tsx
│   ├── healthcare/PatientInsights.tsx
│   ├── financial/InvoiceProcessor.tsx
│   └── WidgetRegistry.tsx
│
├── services/
│   ├── ApplicationGenerator.ts    # Enhanced with widgets
│   └── YaviConnector.ts           # 8 new methods added
│
└── app/dashboard/yavi-studio/
    ├── page.tsx                   # Updated dashboard
    └── widgets/page.tsx           # Widget showcase
```

## 🎨 Widget Customization

Each widget accepts standard props and can be customized:

```tsx
<ContractAnalyzer
  documentId="contract-123"
  onDataLoaded={(data) => console.log(data)}
  theme="dark"  // Optional
/>
```

## 📊 Yavi.ai Integration

### Namespaces
- `legal-contracts` - Legal documents
- `construction-projects` - Construction files
- `healthcare-records` - Patient data (HIPAA)
- `financial-documents` - Invoices & receipts

### Data Extractors
Each widget uses specific extractors:
```typescript
// Legal
['parties', 'terms', 'obligations', 'financials', 'risks']

// Construction
['milestones', 'budget', 'timeline', 'safety', 'permits']

// Healthcare
['diagnosis', 'medications', 'vitals', 'allergies', 'risk-factors']

// Financial
['invoice-items', 'totals', 'tax', 'vendor', 'payment-terms']
```

## 🔍 Testing Widgets

### Test in Widget Showcase
1. Go to Widget Library page
2. Select industry and widget
3. View live demo with sample data
4. Toggle code view to see implementation

### Test in Builder v3
1. Navigate to Builder v3
2. Generate an app with widget-related prompt
3. Widget will be automatically integrated
4. Preview generated application

## 🚨 Troubleshooting

### Widget Not Loading
- Check console for errors
- Verify YaviConnector API endpoint
- Ensure widget is registered in WidgetRegistry.tsx

### No Data Displaying
- Verify Yavi API key is set
- Check namespace exists
- Confirm document ID is valid

### Import Errors
- Widgets use named exports: `import { ContractAnalyzer }`
- Use dynamic imports for lazy loading
- Check TypeScript paths configuration

## 📈 Performance Tips

1. **Lazy Loading**: Widgets are automatically code-split
2. **Caching**: Document queries are cached for 15 minutes
3. **Memoization**: Use React.memo for expensive components
4. **Virtual Scrolling**: Enabled for large datasets

## 🎓 Learning Resources

### Widget Examples
See `PHASE_4_COMPLETE.md` for detailed examples

### API Documentation
- YaviConnector methods in `src/services/YaviConnector.ts`
- Widget configs in `src/widgets/WidgetRegistry.tsx`

### Code Generation
- ApplicationGenerator in `src/services/ApplicationGenerator.ts`
- Shows how widgets are auto-integrated

## ✅ Phase 4 Checklist

- [x] Legal widget created and working
- [x] Construction widget created and working
- [x] Healthcare widget created and working
- [x] Financial widget created and working
- [x] Widget Registry implemented
- [x] Application Generator enhanced
- [x] YaviConnector extended (8 new methods)
- [x] Widget Showcase page created
- [x] Dashboard updated with Widget Library link
- [x] Documentation completed

## 🎯 Next Steps

1. **Test All Widgets**: Visit Widget Library and test each industry
2. **Generate an App**: Use Builder v3 to create widget-powered app
3. **Review Code**: Check generated integration code
4. **Customize**: Modify widgets for your needs
5. **Deploy**: Ready for Phase 5 (Production Deployment)

## 🔗 Quick Links

- Widget Library: `/dashboard/yavi-studio/widgets`
- Builder v3: `/dashboard/yavi-studio/builder-v3`
- Main Dashboard: `/dashboard/yavi-studio`

## 📞 Support

For issues or questions:
1. Check `PHASE_4_COMPLETE.md` for detailed documentation
2. Review widget source code in `src/widgets/`
3. Test with Widget Showcase first

---

**Phase 4 Complete** ✅
Ready for real-world testing and Phase 5 deployment!
