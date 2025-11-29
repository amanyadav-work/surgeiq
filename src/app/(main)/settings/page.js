'use client'

import React from 'react'
import UserEditForm from '@/components/ui/UserEditForm';

const Settings = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black">Edit Profile</h2>
      <UserEditForm />
    </div>
  )
}

export default Settings