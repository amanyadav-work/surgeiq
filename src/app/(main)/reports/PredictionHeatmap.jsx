import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PredictionHeatmap({ data }) {
  if (!data || !data.predictions) return null;

  const days = data.predictions.map(p => p.date);
  const values = data.predictions.map((p, idx) => [0, idx, p.predicted_patient_count]);

  const option = {
    title: { text: 'Patient Count Heatmap' },
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: days, splitArea: { show: true } },
    yAxis: { type: 'category', data: ['Patient Count'], splitArea: { show: true } },
    visualMap: {
      min: Math.min(...data.predictions.map(p => p.predicted_patient_count)),
      max: Math.max(...data.predictions.map(p => p.predicted_patient_count)),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
    },
    series: [{
      name: 'Patient Count',
      type: 'heatmap',
      data: values,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Patient Count Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 300 }} />
      </CardContent>
    </Card>
  );
}
