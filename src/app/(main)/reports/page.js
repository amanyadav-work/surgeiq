'use client';

import React, { useState, useEffect } from 'react';
import { GenerateAiDataGroq } from '@/actions/groq';
import PredictionCharts from './PredictionCharts';
import PredictionAlertCards from './PredictionAlertCards';
import PredictionReasonCards from './PredictionReasonCards';
import PredictionTable from './PredictionTable';
import { Switch } from '@/components/ui/switch';

const dummyData = `
| date       | AQI | temperature | holiday/event | patient_count | oxygen_used | beds_used |
| ---------- | --- | ----------- | ------------- | ------------- | ----------- | --------- |
| 2023-01-05 | 320 | 18°C        | None          | 120           | 45          | 80        |
| 2023-01-06 | 350 | 17°C        | None          | 140           | 55          | 82        |
| 2023-01-07 | 370 | 16°C        | None          | 160           | 60          | 85        |
| 2023-01-08 | 400 | 15°C        | Festival      | 200           | 80          | 100       |
| 2023-01-09 | 380 | 16°C        | None          | 170           | 65          | 90        |
| 2023-01-10 | 360 | 17°C        | None          | 150           | 55          | 85        |
| 2023-01-11 | 340 | 18°C        | None          | 130           | 50          | 80        |
| 2023-01-12 | 330 | 19°C        | None          | 125           | 48          | 78        |
| 2023-01-13 | 320 | 20°C        | None          | 120           | 45          | 75        |
| 2023-01-14 | 310 | 21°C        | None          | 115           | 43          | 73        |
| 2023-01-15 | 300 | 22°C        | None          | 110           | 40          | 70        |
| 2023-01-16 | 310 | 21°C        | None          | 115           | 43          | 73        |
| 2023-01-17 | 320 | 20°C        | None          | 120           | 45          | 75        |
| 2023-01-18 | 330 | 19°C        | None          | 125           | 48          | 78        |
| 2023-01-19 | 340 | 18°C        | Pollution     | 180           | 70          | 95        |
`;

const prompt = `
You are a hospital surge prediction AI. Given the following 15 days of hospital data:

${dummyData}

Predict the next 15 days for patient surges, considering latest news, upcoming events, and predicted AQI, temperature, and other factors. 
Return your answer in the following JSON format:

{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predicted_patient_count": number,
      "surge": boolean,
      "reason": [string]
    },
    ...
  ],
  "surge_days": [date strings where surge=true]
}
`;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
}

const Reports = () => {
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
          if (aiResult.surge_days) {
            aiResult.surge_days = aiResult.surge_days.map(formatDate);
          }
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
      <h2 className="text-xl font-bold mb-4">Surge Prediction Report</h2>
      {loading && (
        <div className="mb-4 text-blue-600">Loading predictions...</div>
      )}
      {result && !result.error && (
        <>
          <PredictionAlertCards data={result} />
          <PredictionCharts data={result} />
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={showTable} onCheckedChange={setShowTable} id="view-switch" />
            <label htmlFor="view-switch" className="text-sm">
              {showTable ? 'Table View' : 'Card View'}
            </label>
          </div>
          {showTable ? (
            <PredictionTable data={result} />
          ) : (
            <PredictionReasonCards data={result} />
          )}
        </>
      )}
      {result && result.error && (
        <div className="text-red-500">{result.error}</div>
      )}
    </div>
  );
};

export default Reports;