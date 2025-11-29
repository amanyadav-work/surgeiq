"use client";

import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useFetch } from "react-hooks-toolkit-amanyadav";
import { toast } from "sonner";

const UserContext = createContext({ isLoading: true, user: null, setUser: () => { }, refetch: () => { }, editUser: (userId, updates) => { } });

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true)

  const { refetch } = useFetch({
    auto: true,
    url: `/api/user`,
    withAuth: true,
    onSuccess: (result) => {
      setUser(result);
      console.log(result)
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err.message || "An error occurred while fetching user data");
      setIsLoading(false);
    },
  });
  const editUser = async (userId, updates) => {
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (res.ok) {
        setUser(result.user);
        toast.success('User updated successfully');
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (isLoading) return <Loader fullScreen />

  return (
    <UserContext.Provider value={{ user, setUser, refetch, isLoading, editUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);