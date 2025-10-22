"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="hidden md:flex w-1/2 relative h-full">
        <Image
          src="/motivation_image.jpeg" 
          alt="Eco motivation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#C8D8B4] flex items-center justify-center">
          <div className="text-center px-6 text-white">
            <h1 className="text-4xl font-bold">Eco-Collect Kenya</h1>
            <p className="mt-2 text-sm italic">
            Connecting citizens and corporations for a circular economy
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full md:w-1/2 h-full items-center justify-center bg-white py-10 px-6 sm:px-10 relative">
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/logo.jpeg"
            alt="Eco background"
            fill
            className="object-cover opacity-20 -z-10"
            priority
          />
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/90 border border-green-100 rounded-3xl shadow-lg p-8 sm:p-10"
        >
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-green-700">Eco-Collect Kenya</h2>
            <p className="text-gray-600 mt-1 text-sm italic">
              Connecting citizens and corporations for a circular economy
            </p>
          </div>
          <div className="flex bg-gray-100 rounded-full p-1 mt-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 rounded-full transition-all duration-300 ${
                isLogin ? "bg-green-600 text-white" : "text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 rounded-full transition-all duration-300 ${
                !isLogin ? "bg-green-600 text-white" : "text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>
          {isLogin ? <LoginForm /> : <SignupForm />}
        </motion.div>
      </div>
    </main>
  );
}

function LoginForm() {
  return (
    <form className="space-y-4 mt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Enter your password"
        />
      </div>
      <div className="text-right">
        <a href="#" className="text-sm text-green-600 hover:underline">
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        Login
      </button>
    </form>
  );
}

function SignupForm() {
  return (
    <form className="space-y-4 mt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Enter your password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="Confirm password"
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-1 text-gray-700">Select Role</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="civilian" />
            Civilian
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="corporate" />
            Corporate
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        Register
      </button>
    </form>
  );
}
