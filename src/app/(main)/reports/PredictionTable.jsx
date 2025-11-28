import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PredictionTable({ data }) {
  if (!data || !data.predictions) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Prediction Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Patients</th>
                <th className="px-2 py-1 border">Surge</th>
                <th className="px-2 py-1 border">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.predictions.map((p) => (
                <tr key={p.date} className={p.surge ? 'bg-red-50' : ''}>
                  <td className="px-2 py-1 border">{p.date}</td>
                  <td className="px-2 py-1 border">{p.predicted_patient_count}</td>
                  <td className="px-2 py-1 border">{p.surge ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1 border">{p.reason?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
