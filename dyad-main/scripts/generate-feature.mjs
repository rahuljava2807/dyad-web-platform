import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

const componentName = process.argv[2];
const componentType = process.argv[3] || 'form'; // Default to form

if (!componentName) {
  console.error('Please provide a component name.');
  process.exit(1);
}

const componentNamePascal = componentName.charAt(0).toUpperCase() + componentName.slice(1);
const componentNameLower = componentName.toLowerCase();

// --- Component Content Generation ---

const generateFormComponent = (componentNamePascal) => `
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

const ${componentNamePascal} = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success('Form submitted successfully!');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>${componentNamePascal}</CardTitle>
        <CardDescription>A form with validation using react-hook-form and zod.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is a sample form field.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ${componentNamePascal};
`;

const generateTableComponent = (componentNamePascal) => `
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
];

const ${componentNamePascal} = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${componentNamePascal}</CardTitle>
        <CardDescription>A data table using shadcn-ui.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ${componentNamePascal};
`;

let componentContent;
if (componentType === 'table') {
  componentContent = generateTableComponent(componentNamePascal);
} else {
  componentContent = generateFormComponent(componentNamePascal);
}

// File Contents

const pageContent = `
import React from 'react';
import ${componentNamePascal} from '../components/${componentNamePascal}';

const ${componentNamePascal}Page = () => {
  return (
    <div className="container mx-auto p-4">
      <${componentNamePascal} />
    </div>
  );
};

export default ${componentNamePascal}Page;
`;

const routeContent = `
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import ${componentNamePascal}Page from '../pages/${componentNamePascal}Page';

export const ${componentNameLower}Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/${componentNameLower}',
  component: ${componentNamePascal}Page,
});
`;

// File Paths
const componentDir = path.resolve(process.cwd(), 'src/components');
const pageDir = path.resolve(process.cwd(), 'src/pages');
const routeDir = path.resolve(process.cwd(), 'src/routes');

const componentFilePath = path.join(componentDir, `${componentNamePascal}.tsx`);
const pageFilePath = path.join(pageDir, `${componentNamePascal}Page.tsx`);
const routeFilePath = path.join(routeDir, `${componentNameLower}.tsx`);
const routerFilePath = path.resolve(process.cwd(), 'src/router.ts');
const sidebarFilePath = path.resolve(process.cwd(), 'src/components/app-sidebar.tsx');

// Main function
(async () => {
  try {
    // 1. Create Component, Page, and Route files
    await mkdir(componentDir, { recursive: true });
    await writeFile(componentFilePath, componentContent.trim());
    console.log(`Created component: ${componentFilePath}`);

    await mkdir(pageDir, { recursive: true });
    await writeFile(pageFilePath, pageContent.trim());
    console.log(`Created page: ${pageFilePath}`);

    await mkdir(routeDir, { recursive: true });
    await writeFile(routeFilePath, routeContent.trim());
    console.log(`Created route: ${routeFilePath}`);

    // 2. Update router.ts
    const routerFileContent = await readFile(routerFilePath, 'utf-8');
    const newImport = `import { ${componentNameLower}Route } from "./routes/${componentNameLower}";\n`;
    const updatedRouterContent = routerFileContent.replace(
      /(const routeTree = rootRoute.addChildren\(\[)/,
      `${newImport}$1`
    ).replace(
      /(const routeTree = rootRoute.addChildren\(\[\n)/,
      `$1  ${componentNameLower}Route,\n`
    );
    await writeFile(routerFilePath, updatedRouterContent);
    console.log(`Updated router: ${routerFilePath}`);

    // 3. Update app-sidebar.tsx
    const sidebarFileContent = await readFile(sidebarFilePath, 'utf-8');
    const newSidebarImport = `  LayoutDashboard,`;
    const newSidebarItem = `  {
    title: "${componentNamePascal}",
    to: "/${componentNameLower}",
    icon: LayoutDashboard,
  },\n];`;

    const updatedSidebarContent = sidebarFileContent.replace(
      /(import \{.*)from "lucide-react";/s,
      `$1,${newSidebarImport}\n} from "lucide-react";`
    ).replace(
      /(\nconst items = \[)/,
      `$1\n${newSidebarItem.substring(0, newSidebarItem.length - 2)}`
    );

    await writeFile(sidebarFilePath, updatedSidebarContent);
    console.log(`Updated sidebar: ${sidebarFilePath}`);

    console.log(`\nSuccessfully created and integrated feature "${componentNamePascal}".`);

  } catch (error) {
    console.error('Error generating files:', error);
    process.exit(1);
  }
})();