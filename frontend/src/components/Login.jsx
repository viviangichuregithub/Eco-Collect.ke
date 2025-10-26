"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '../lib/api';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'civilian'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call actual backend API
      const response = await apiService.login(formData.email, formData.password);
      
      if (response.user) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect based on user role from backend
        if (response.user.role === 'civilian') {
          router.push('/civilian');
        } else if (response.user.role === 'corporative') {
          router.push('/corporative');
        } else {
          router.push('/civilian'); // default fallback
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Type
        </label>
        <select
          name="userType"
          value={formData.userType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E62] focus:border-transparent"
        >
          <option value="civilian">Civilian</option>
          <option value="corporative">Corporate</option>
        </select>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E62] focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E62] focus:border-transparent"
          placeholder="Enter your password"
        />
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => router.push('/forgetpassword')}
          className="text-sm text-[#355E62] hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#355E62] hover:bg-[#2C4C4F] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
