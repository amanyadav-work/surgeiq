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

Resources available each day:
| date       | oxygen_stock | beds_available | staff_on_duty | ventilators | masks | gloves | medicines | ambulances |
| ---------- | ------------ | -------------- | ------------- | ----------- | ----- | ------ | --------- | ---------- |
| 2023-01-05 | 100          | 80             | 20            | 5           | 500   | 300    | 200       | 3          |
| 2023-01-06 | 90           | 82             | 18            | 5           | 480   | 290    | 210       | 3          |
| 2023-01-07 | 85           | 85             | 22            | 6           | 470   | 280    | 220       | 4          |
| 2023-01-08 | 70           | 100            | 30            | 8           | 600   | 350    | 250       | 5          |
| 2023-01-09 | 80           | 90             | 25            | 6           | 500   | 320    | 230       | 4          |
| 2023-01-10 | 95           | 85             | 20            | 5           | 480   | 300    | 210       | 3          |
| 2023-01-11 | 100          | 80             | 18            | 5           | 470   | 290    | 200       | 3          |
| 2023-01-12 | 105          | 78             | 17            | 4           | 460   | 280    | 190       | 2          |
| 2023-01-13 | 110          | 75             | 16            | 4           | 450   | 270    | 180       | 2          |
| 2023-01-14 | 115          | 73             | 15            | 4           | 440   | 260    | 170       | 2          |
| 2023-01-15 | 120          | 70             | 14            | 3           | 430   | 250    | 160       | 2          |
| 2023-01-16 | 115          | 73             | 15            | 4           | 440   | 260    | 170       | 2          |
| 2023-01-17 | 110          | 75             | 16            | 4           | 450   | 270    | 180       | 2          |
| 2023-01-18 | 105          | 78             | 17            | 4           | 460   | 280    | 190       | 2          |
| 2023-01-19 | 100          | 95             | 28            | 7           | 600   | 350    | 250       | 5          |
`;

const prompt = `
You are a hospital surge and resource prediction AI. Given the following 15 days of hospital data and resources available each day:

${dummyData}

Predict the next 15 days for:
1. Patient surges (as before).
2. Resource needs for each resource (oxygen, beds, staff, ventilators, masks, gloves, medicines, ambulances) for each day, especially on surge days.

Return your answer in the following JSON format:

{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predicted_patient_count": number,
      "surge": boolean,
      "reason": [string],
      "resources_needed": {
        "oxygen": number,
        "beds": number,
        "staff": number,
        "ventilators": number,
        "masks": number,
        "gloves": number,
        "medicines": number,
        "ambulances": number
      }
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

function ResourcesTable({ data }) {
  if (!data || !data.predictions) return null;
  return (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-muted">
            <th className="px-2 py-1 border">Date</th>
            <th className="px-2 py-1 border">Oxygen</th>
            <th className="px-2 py-1 border">Beds</th>
            <th className="px-2 py-1 border">Staff</th>
            <th className="px-2 py-1 border">Ventilators</th>
            <th className="px-2 py-1 border">Masks</th>
            <th className="px-2 py-1 border">Gloves</th>
            <th className="px-2 py-1 border">Medicines</th>
            <th className="px-2 py-1 border">Ambulances</th>
          </tr>
        </thead>
        <tbody>
          {data.predictions.map((p) => (
            <tr key={p.date}>
              <td className="px-2 py-1 border">{p.date}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.oxygen}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.beds}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.staff}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.ventilators}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.masks}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.gloves}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.medicines}</td>
              <td className="px-2 py-1 border">{p.resources_needed?.ambulances}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourcesCards({ data }) {
  if (!data || !data.predictions) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {data.predictions.map((p) => (
        <div key={p.date} className="border rounded p-4 bg-white shadow">
          <div className="font-bold mb-2">{p.date}</div>
          <div className="mb-1">Oxygen: <span className="font-semibold">{p.resources_needed?.oxygen}</span></div>
          <div className="mb-1">Beds: <span className="font-semibold">{p.resources_needed?.beds}</span></div>
          <div className="mb-1">Staff: <span className="font-semibold">{p.resources_needed?.staff}</span></div>
          <div className="mb-1">Ventilators: <span className="font-semibold">{p.resources_needed?.ventilators}</span></div>
          <div className="mb-1">Masks: <span className="font-semibold">{p.resources_needed?.masks}</span></div>
          <div className="mb-1">Gloves: <span className="font-semibold">{p.resources_needed?.gloves}</span></div>
          <div className="mb-1">Medicines: <span className="font-semibold">{p.resources_needed?.medicines}</span></div>
          <div className="mb-1">Ambulances: <span className="font-semibold">{p.resources_needed?.ambulances}</span></div>
        </div>
      ))}
    </div>
  );
}

const Reports = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [showResourcesTable, setShowResourcesTable] = useState(true);

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
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={showResourcesTable} onCheckedChange={setShowResourcesTable} id="resources-view-switch" />
            <label htmlFor="resources-view-switch" className="text-sm">
              {showResourcesTable ? 'Resources Table View' : 'Resources Card View'}
            </label>
          </div>
          {showResourcesTable ? (
            <ResourcesTable data={result} />
          ) : (
            <ResourcesCards data={result} />
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