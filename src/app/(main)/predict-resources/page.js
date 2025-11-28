'use client';

import React, { useState, useEffect } from 'react';
import { GenerateAiDataGroq } from '@/actions/groq';
import PredictionTable from '../reports/PredictionTable';
import PredictionReasonCards from '../reports/PredictionReasonCards';
import { Switch } from '@/components/ui/switch';

const resourceData = `
| date       | oxygen_stock | beds_available | staff_on_duty | ventilators | event/holiday |
| ---------- | ------------ | -------------- | ------------- | ----------- | ------------- |
| 2023-01-05 | 100          | 80             | 20            | 5           | None          |
| 2023-01-06 | 90           | 82             | 18            | 5           | None          |
| 2023-01-07 | 85           | 85             | 22            | 6           | None          |
| 2023-01-08 | 70           | 100            | 30            | 8           | Festival      |
| 2023-01-09 | 80           | 90             | 25            | 6           | None          |
| 2023-01-10 | 95           | 85             | 20            | 5           | None          |
| 2023-01-11 | 100          | 80             | 18            | 5           | None          |
| 2023-01-12 | 105          | 78             | 17            | 4           | None          |
| 2023-01-13 | 110          | 75             | 16            | 4           | None          |
| 2023-01-14 | 115          | 73             | 15            | 4           | None          |
| 2023-01-15 | 120          | 70             | 14            | 3           | None          |
| 2023-01-16 | 115          | 73             | 15            | 4           | None          |
| 2023-01-17 | 110          | 75             | 16            | 4           | None          |
| 2023-01-18 | 105          | 78             | 17            | 4           | None          |
| 2023-01-19 | 100          | 95             | 28            | 7           | Pollution     |
`;

const prompt = `
You are a hospital resource prediction AI. Given the following 15 days of resource data:

${resourceData}

Predict the next 15 days for resource needs (oxygen, beds, staff, ventilators), considering latest news, upcoming events, and trends. 
Return your answer in the following JSON format:

{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "oxygen_needed": number,
      "beds_needed": number,
      "staff_needed": number,
      "ventilators_needed": number,
      "reason": [string]
    },
    ...
  ]
}
`;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
}

const PredictResources = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const aiResult = await GenerateAiDataGroq([
          { role: 'user', content: prompt }
        ]);
        // Convert dates to human format
        if (aiResult && aiResult.predictions) {
          aiResult.predictions = aiResult.predictions.map(p => ({
            ...p,
            date: formatDate(p.date)
          }));
        }
        setResult(aiResult);
      } catch (err) {
        setResult({ error: err.message });
      }
      setLoading(false);
    };
    fetchPrediction();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Resource Prediction Report</h2>
      {loading && (
        <div className="mb-4 text-blue-600">Loading predictions...</div>
      )}
      {result && !result.error && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={showTable} onCheckedChange={setShowTable} id="view-switch" />
            <label htmlFor="view-switch" className="text-sm">
              {showTable ? 'Table View' : 'Card View'}
            </label>
          </div>
          {showTable ? (
            <ResourcePredictionTable data={result} />
          ) : (
            <ResourcePredictionCards data={result} />
          )}
        </>
      )}
      {result && result.error && (
        <div className="text-red-500">{result.error}</div>
      )}
    </div>
  );
};

function ResourcePredictionTable({ data }) {
  if (!data || !data.predictions) return null;
  return (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-muted">
            <th className="px-2 py-1 border">Date</th>
            <th className="px-2 py-1 border">Oxygen Needed</th>
            <th className="px-2 py-1 border">Beds Needed</th>
            <th className="px-2 py-1 border">Staff Needed</th>
            <th className="px-2 py-1 border">Ventilators Needed</th>
            <th className="px-2 py-1 border">Reason</th>
          </tr>
        </thead>
        <tbody>
          {data.predictions.map((p) => (
            <tr key={p.date}>
              <td className="px-2 py-1 border">{p.date}</td>
              <td className="px-2 py-1 border">{p.oxygen_needed}</td>
              <td className="px-2 py-1 border">{p.beds_needed}</td>
              <td className="px-2 py-1 border">{p.staff_needed}</td>
              <td className="px-2 py-1 border">{p.ventilators_needed}</td>
              <td className="px-2 py-1 border">{p.reason?.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourcePredictionCards({ data }) {
  if (!data || !data.predictions) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {data.predictions.map((p) => (
        <div key={p.date} className="border rounded p-4 bg-white shadow">
          <div className="font-bold mb-2">{p.date}</div>
          <div className="mb-1">Oxygen Needed: <span className="font-semibold">{p.oxygen_needed}</span></div>
          <div className="mb-1">Beds Needed: <span className="font-semibold">{p.beds_needed}</span></div>
          <div className="mb-1">Staff Needed: <span className="font-semibold">{p.staff_needed}</span></div>
          <div className="mb-1">Ventilators Needed: <span className="font-semibold">{p.ventilators_needed}</span></div>
          <div className="text-xs text-muted-foreground mt-2">{p.reason?.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}

export default PredictResources;
