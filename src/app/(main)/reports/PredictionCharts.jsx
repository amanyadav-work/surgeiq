import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getPredictionNote } from './predictionNotes';

export default function PredictionCharts({ data }) {
  if (!data || !data.predictions) return null;

  const dates = data.predictions.map(p => p.date);
  const patientCounts = data.predictions.map(p => p.predicted_patient_count);
  const surgeFlags = data.predictions.map(p => p.surge ? 1 : 0);
  const aqi = data.predictions.map(p => {
    const match = p.reason[0]?.match(/AQI \((\d+)/);
    return match ? Number(match[1]) : null;
  });
  const temp = data.predictions.map(p => {
    const match = p.reason[0]?.match(/temperature \((\d+)°C/);
    return match ? Number(match[1]) : null;
  });

  const patientChart = {
    title: { text: 'Patient Count' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Patient Count',
        type: 'line',
        data: patientCounts,
        smooth: true,
        lineStyle: { color: '#007bff' }
      }
    ]
  };

  const surgeChart = {
    title: { text: 'Surge Days' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', min: 0, max: 1 },
    series: [
      {
        name: 'Surge',
        type: 'bar',
        data: surgeFlags,
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  };

  const envChart = {
    title: { text: 'AQI & Temperature' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['AQI', 'Temperature'] },
    xAxis: { type: 'category', data: dates },
    yAxis: [{ type: 'value', name: 'AQI' }, { type: 'value', name: 'Temp', min: 0, max: 50 }],
    series: [
      {
        name: 'AQI',
        type: 'line',
        data: aqi,
        yAxisIndex: 0,
        lineStyle: { color: '#ffa500' }
      },
      {
        name: 'Temperature',
        type: 'line',
        data: temp,
        yAxisIndex: 1,
        lineStyle: { color: '#00b894' }
      }
    ]
  };

  const note = getPredictionNote(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Patient Count Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={patientChart} style={{ height: 300 }} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Surge Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={surgeChart} style={{ height: 300 }} />
        </CardContent>
      </Card>
      {/* <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>AQI & Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={envChart} style={{ height: 300 }} />
        </CardContent>
      </Card> */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Prediction Note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <strong>Note:</strong> {note}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
