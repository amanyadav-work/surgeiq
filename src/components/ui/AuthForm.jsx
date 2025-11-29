
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import Link from 'next/link';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import FormField from './FormField';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { useFetch } from 'react-hooks-toolkit-amanyadav';
import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

export function AuthForm({ className, pathname = 'login', ...props }) {
  const isSignup = pathname === 'register';
  const { setUser } = useUser();
  const dbName = process.env.NEXT_PUBLIC_DB_NAME;

  // Zod schemas
  const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    hospital_name: z.string().min(1, 'Hospital name is required'),
    location: z.string().min(1, 'Location is required'),
    role: z.string().min(1, 'Role is required'),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  });

  const formSchema = isSignup ? signupSchema : loginSchema;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Use correct endpoints
  const { refetch, isLoading } = useFetch({
    url: isSignup ? '/api/auth/register' : '/api/auth/login',
    method: 'POST',
    auto: false,
    withAuth: true,
    onSuccess: (res) => {
      console.log('✅ Logged in:', res);
      setUser(res.user);
      router.push('/dashboard'); 
    },
    onError: (err) => {
      toast.error(err.message || 'An error occurred');
    },
  });

  const onSubmit = (data) => {
    refetch({
      payload: {
        db_name: dbName,
        ...data,
      }
    });
  };

  // Watch values for select fields
  const selectedLocation = watch('location');
  const selectedRole = watch('role');

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  {isSignup ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {isSignup
                    ? 'Sign up for an Acme Inc account'
                    : 'Login to your Acme Inc account'}
                </p>
              </div>

              {/* Additional signup fields */}
              {isSignup && (
                <>
                  {/* Name first */}
                  <FormField
                    id="name"
                    label="Name"
                    placeholder="Your full name"
                    register={register}
                    errors={errors}
                  />

                  <FormField
                    id="hospital_name"
                    label="Hospital Name"
                    placeholder="Your hospital name"
                    register={register}
                    errors={errors}
                  />

                  {/* Location and Role side by side */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <Select
                        value={selectedLocation}
                        onValueChange={val => setValue('location', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Kolkata">Kolkata</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.location && (
                        <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="role" className="block text-sm font-medium mb-1">
                        Role
                      </label>
                      <Select
                        value={selectedRole}
                        onValueChange={val => setValue('role', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Doctor">Doctor</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <FormField
                id="email"
                label="Email"
                placeholder="you@example.com"
                register={register}
                errors={errors}
                type="email"
              />

              {/* Password */}
              <FormField
                id="password"
                label="Password"
                placeholder="Your password"
                register={register}
                errors={errors}
                isSecret={true}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSignup ? 'Sign up' : isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="underline underline-offset-4">
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="https://www.sermo.com/wp-content/uploads/2025/03/seo-blog-header-ai-superhuman-calculator.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}