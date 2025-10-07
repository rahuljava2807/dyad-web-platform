import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>This is a newly generated component.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Component content goes here.</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;