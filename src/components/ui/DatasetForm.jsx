'use client';

import { useState } from 'react';
import { useFetch } from 'react-hooks-toolkit-amanyadav';
import { Button } from './button';
import { toast } from 'sonner';

const initialEntry = {
  date: '',
  AQI: '',
  temperature: '',
  holiday_event: '',
  patient_count: '',
  oxygen_used: '',
  beds_used: '',
  resources: {
    oxygen_stock: '',
    beds_available: '',
    staff_on_duty: '',
    ventilators: '',
    masks: '',
    gloves: '',
    medicines: '',
    ambulances: '',
  }
};

export default function DatasetForm() {
  const [entry, setEntry] = useState(initialEntry);
  const [entries, setEntries] = useState([]);

  const { refetch: fetchDataset } = useFetch({
    url: '/api/dataset',
    method: 'GET',
    auto: true,
    withAuth: true,
    onSuccess: (res) => {
      setEntries(res.dataset?.entries || []);
    }
  });

  const { refetch: saveEntry, isLoading } = useFetch({
    url: '/api/dataset',
    method: 'POST',
    auto: false,
    withAuth: true,
    onSuccess: (res) => {
      setEntries(res.dataset.entries);
      toast.success('Entry saved!');
      setEntry(initialEntry);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save entry');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in entry.resources) {
      setEntry({
        ...entry,
        resources: { ...entry.resources, [name]: value }
      });
    } else {
      setEntry({ ...entry, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEntry({ payload: entry });
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-black p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold mb-8 text-black text-center">Add/Update Daily Dataset Entry</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Date</label>
          <input name="date" type="date" value={entry.date} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">AQI</label>
          <input name="AQI" type="number" value={entry.AQI} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Temperature</label>
          <input name="temperature" value={entry.temperature} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Holiday/Event</label>
          <input name="holiday_event" value={entry.holiday_event} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Patient Count</label>
          <input name="patient_count" type="number" value={entry.patient_count} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Oxygen Used</label>
          <input name="oxygen_used" type="number" value={entry.oxygen_used} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Beds Used</label>
          <input name="beds_used" type="number" value={entry.beds_used} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        {/* Resources */}
        <div>
          <label className="block text-sm font-semibold mb-1">Oxygen Stock</label>
          <input name="oxygen_stock" type="number" value={entry.resources.oxygen_stock} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Beds Available</label>
          <input name="beds_available" type="number" value={entry.resources.beds_available} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Staff On Duty</label>
          <input name="staff_on_duty" type="number" value={entry.resources.staff_on_duty} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Ventilators</label>
          <input name="ventilators" type="number" value={entry.resources.ventilators} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Masks</label>
          <input name="masks" type="number" value={entry.resources.masks} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Gloves</label>
          <input name="gloves" type="number" value={entry.resources.gloves} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Medicines</label>
          <input name="medicines" type="number" value={entry.resources.medicines} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Ambulances</label>
          <input name="ambulances" type="number" value={entry.resources.ambulances} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required />
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-8 py-2 text-base">Save Entry</Button>
        </div>
      </form>
      <h3 className="text-xl font-bold mb-4 text-black text-center">Your Dataset Entries</h3>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm border bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Date</th>
              <th className="p-3">AQI</th>
              <th className="p-3">Temp</th>
              <th className="p-3">Holiday/Event</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Oxygen Used</th>
              <th className="p-3">Beds Used</th>
              <th className="p-3">Oxygen Stock</th>
              <th className="p-3">Beds Avail</th>
              <th className="p-3">Staff</th>
              <th className="p-3">Ventilators</th>
              <th className="p-3">Masks</th>
              <th className="p-3">Gloves</th>
              <th className="p-3">Medicines</th>
              <th className="p-3">Ambulances</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.date} className="border-t hover:bg-gray-50">
                <td className="p-3">{e.date}</td>
                <td className="p-3">{e.AQI}</td>
                <td className="p-3">{e.temperature}</td>
                <td className="p-3">{e.holiday_event}</td>
                <td className="p-3">{e.patient_count}</td>
                <td className="p-3">{e.oxygen_used}</td>
                <td className="p-3">{e.beds_used}</td>
                <td className="p-3">{e.resources?.oxygen_stock}</td>
                <td className="p-3">{e.resources?.beds_available}</td>
                <td className="p-3">{e.resources?.staff_on_duty}</td>
                <td className="p-3">{e.resources?.ventilators}</td>
                <td className="p-3">{e.resources?.masks}</td>
                <td className="p-3">{e.resources?.gloves}</td>
                <td className="p-3">{e.resources?.medicines}</td>
                <td className="p-3">{e.resources?.ambulances}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
