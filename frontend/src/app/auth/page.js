"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../../components/Login';
import SignUp from '../../components/SignUp';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#355E62] to-[#2C4C4F] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Eco-Collect</h1>
          <p className="text-[#ECF1E6] text-sm">
            {isLogin ? 'Welcome back!' : 'Join our eco-friendly community'}
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-300 ${
                isLogin
                  ? 'bg-[#355E62] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#355E62]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-300 ${
                !isLogin
                  ? 'bg-[#355E62] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#355E62]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Component */}
          {isLogin ? <Login /> : <SignUp />}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-[#ECF1E6] text-sm hover:text-white transition-colors duration-300"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
