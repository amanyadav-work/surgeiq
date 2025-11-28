import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PredictionAlertCards({ data }) {
  if (!data || !data.predictions) return null;

  const surgeDays = data.surge_days || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Surge Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{surgeDays.length}</div>
          <div className="text-sm text-muted-foreground">
            {surgeDays.length > 0
              ? `Surge expected on: ${surgeDays.join(', ')}`
              : 'No surges predicted.'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Next Surge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">
            {surgeDays.length > 0 ? surgeDays[0] : 'None'}
          </div>
          <div className="text-sm text-muted-foreground">
            {surgeDays.length > 0
              ? 'Prepare for increased patient load.'
              : 'Normal operations expected.'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
