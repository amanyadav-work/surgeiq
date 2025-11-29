'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from './button';
import { toast } from 'sonner';
import { useFetch } from 'react-hooks-toolkit-amanyadav';

export default function UserEditForm() {
  const { user, setUser, refetch } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    hospital_name: user?.hospital_name || '',
    location: user?.location || '',
    role: user?.role || '',
  });

  // Update form when user changes
  useEffect(() => {
    setForm({
      name: user?.name || '',
      hospital_name: user?.hospital_name || '',
      location: user?.location || '',
      role: user?.role || '',
    });
  }, [user]);

  const {
    refetch: updateUser,
    isLoading,
  } = useFetch({
    url: '/api/user',
    method: 'POST',
    auto: false,
    withAuth: true,
    onSuccess: (result) => {
      setUser(result.user);
      toast.success('User updated successfully');
      refetch(); // refresh user context
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user');
    },
  });

  if (!user) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateUser({ payload: form });
    setEditMode(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      {!editMode ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name:</label>
            <div className="text-base text-gray-900">{user.name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name:</label>
            <div className="text-base text-gray-900">{user.hospital_name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location:</label>
            <div className="text-base text-gray-900">{user.location}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role:</label>
            <div className="text-base text-gray-900">{user.role}</div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setEditMode(true)} className="px-6 py-2">Edit</Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name:</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital Name:</label>
            <input
              name="hospital_name"
              value={form.hospital_name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location:</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role:</label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="px-6 py-2">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="px-6 py-2">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}