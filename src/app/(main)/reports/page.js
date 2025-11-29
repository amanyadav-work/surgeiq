'use client';

import React, { useState, useEffect } from 'react';
import { GenerateAiDataGroq } from '@/actions/groq';
import PredictionCharts from './PredictionCharts';
import PredictionAlertCards from './PredictionAlertCards';
import PredictionReasonCards from './PredictionReasonCards';
import PredictionTable from './PredictionTable';
import { Switch } from '@/components/ui/switch';
import Loader from '@/components/ui/Loader';
import { useFetch } from 'react-hooks-toolkit-amanyadav';

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
          <tr className="bg-muted text-black">
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
            <tr key={p.date} className='text-black'>
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
        <div key={p.date} className="border rounded p-4 text-black shadow">
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

function generateDummyData(entries) {
  // Generate main data table
  let mainTable = `| date       | AQI | temperature | holiday/event | patient_count | oxygen_used | beds_used |\n| ---------- | --- | ----------- | ------------- | ------------- | ----------- | --------- |\n`;
  let resourcesTable = `| date       | oxygen_stock | beds_available | staff_on_duty | ventilators | masks | gloves | medicines | ambulances |\n| ---------- | ------------ | -------------- | ------------- | ----------- | ----- | ------ | --------- | ---------- |\n`;

  for (const e of entries) {
    mainTable += `| ${e.date} | ${e.AQI} | ${e.temperature} | ${e.holiday_event || 'None'} | ${e.patient_count} | ${e.oxygen_used} | ${e.beds_used} |\n`;
    resourcesTable += `| ${e.date} | ${e.resources?.oxygen_stock ?? ''} | ${e.resources?.beds_available ?? ''} | ${e.resources?.staff_on_duty ?? ''} | ${e.resources?.ventilators ?? ''} | ${e.resources?.masks ?? ''} | ${e.resources?.gloves ?? ''} | ${e.resources?.medicines ?? ''} | ${e.resources?.ambulances ?? ''} |\n`;
  }
  return `${mainTable}\nResources available each day:\n${resourcesTable}`;
}

const Reports = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [showResourcesTable, setShowResourcesTable] = useState(true);
  const [datasetEntries, setDatasetEntries] = useState([]);

  // Fetch dataset entries for current user
  const { refetch: fetchDataset } = useFetch({
    url: '/api/dataset',
    method: 'GET',
    auto: true,
    withAuth: true,
    onSuccess: (res) => {
      setDatasetEntries(res.dataset?.entries || []);
    }
  });

  useEffect(() => {
    if (!datasetEntries.length) return;
    const dummyData = generateDummyData(datasetEntries);

    const prompt = `
You are a hospital surge and resource prediction AI. Given the following ${datasetEntries.length} days of hospital data and resources available each day:

${dummyData}

Predict the next 15 days for:
1. Patient surges (as before).
2. Resource needs for each resource (oxygen, beds, staff, ventilators, masks, gloves, medicines, ambulances) for each day, especially on surge days.

Return your answer in the following JSON format, and ONLY reply with the JSON object (no explanations, no markdown, no extra text):

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

    const fetchPrediction = async () => {
      setLoading(true);
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
  }, [datasetEntries]);

  return (
    <div className="p-8">
      <h2 className="text-xl text-black font-bold mb-4">Surge Prediction Report</h2>
      {loading && (
        <Loader color='blue' className='h-full' />
      )}
      {result && !result.error && (
        <>
          <PredictionAlertCards data={result} />
          <PredictionCharts data={result} />
          <div className="flex items-center gap-2 mb-4">
            <Switch checked={showTable} onCheckedChange={setShowTable} id="view-switch" />
            <label htmlFor="view-switch" className="text-sm text-black">
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
            <label htmlFor="resources-view-switch" className="text-sm text-black">
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
      {!result && !loading && <>
        No data available, please add records
      </>}
    </div>
  );
};

export default Reports;