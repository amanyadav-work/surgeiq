import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PredictionReasonCards({ data }) {
  if (!data || !data.predictions) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {data.predictions.map((p) => (
        <Card key={p.date}>
          <CardHeader>
            <CardTitle>
              {p.date} {p.surge ? <span className="text-red-500">⚠️ Surge</span> : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold mb-2">Predicted Patients: {p.predicted_patient_count}</div>
            <div className="text-sm text-muted-foreground">
              {p.reason && p.reason.length > 0 ? p.reason.join(', ') : 'No reason provided.'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
