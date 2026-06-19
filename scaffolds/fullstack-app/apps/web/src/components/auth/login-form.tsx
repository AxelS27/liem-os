'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 1. Define schema for validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2. Initialize React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Handle submit callback
  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setSuccessMsg(null);
    try {
      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.warn('Login success (handled safely):', data.email);
      setSuccessMsg('Successfully logged in! Redirecting...');
      reset();
    } catch (err) {
      console.error('Failed to log in:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Welcome Back</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email input field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.email
                ? 'border-destructive focus:ring-destructive'
                : 'border-input focus:ring-ring focus:border-ring'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password input field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.password
                ? 'border-destructive focus:ring-destructive'
                : 'border-input focus:ring-ring focus:border-ring'
            }`}
          />
          {errors.password && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Success / Feedback Message */}
        {successMsg && (
          <div className="p-3 bg-secondary/30 border border-border rounded-md animate-fade-in">
            <p className="text-xs text-foreground font-medium">{successMsg}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:bg-muted disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <title>Loading</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}
