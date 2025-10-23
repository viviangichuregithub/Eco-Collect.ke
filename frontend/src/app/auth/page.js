"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState("");

  // Validation schemas
  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
  });

  const signupSchema = Yup.object({
    fullName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "At least 6 chars").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
    role: Yup.string().required("Select a role"),
  });

  // Handlers
  const handleLogin = async (values, { setSubmitting }) => {
    setApiError("");
    try {
      const user = await login(values.email, values.password);

      // Role-based redirect
      if (user.role === "civilian") router.push("/civilian");
      else if (user.role === "corporative") router.push("/corporative");
      else router.push("/");
    } catch (err) {
      setApiError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (values, { setSubmitting }) => {
    setApiError("");
    try {
      // Register and auto-login
      const user = await register({
        user_name: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        terms_approved: true,
      });

      // Auto-login after successful signup
      if (user) {
        if (user.role === "civilian") router.push("/civilian");
        else if (user.role === "corporative") router.push("/corporative");
        else router.push("/");
      }
    } catch (err) {
      setApiError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ECF1E6]">
      <div
        className="flex-1 h-full bg-contain bg-center bg-left bg-no-repeat"
        style={{ backgroundImage: "url('/auth-bg.jpeg')" }}
      />
      <div className="flex-[1.8] flex items-center justify-center px-6 md:px-20 relative bg-[#ECF1E6] mr-20">
        <div className="w-full max-w-4xl bg-white/10 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col h-[90vh] px-16 py-6">
          <div className="text-center mb-6 sticky top-0 z-10">
            <h1 className="text-4xl font-bold text-[#355E62] mb-1">Eco-Collect</h1>
            <p className="text-[#717182] text-sm">
              Connecting citizens and corporations for a circular economy.
            </p>

            <div className="flex justify-center mt-6">
              <div className="flex bg-white rounded-full p-1 relative">
                <motion.div
                  layout
                  className={`absolute top-1 bottom-1 w-[45%] rounded-full bg-[#355E62] transition-all duration-300 ${
                    isLogin ? "left-[2%]" : "left-[50%]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`relative z-10 px-6 font-semibold rounded-full transition-colors duration-300 ${
                    isLogin ? "text-white" : "text-[#355E62]"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`relative z-10 px-6 font-semibold rounded-full transition-colors duration-300 ${
                    !isLogin ? "text-white" : "text-[#355E62]"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-6">
            {apiError && <div className="text-red-500 text-center mb-4">{apiError}</div>}

            <Formik
              key={isLogin ? "login" : "signup"}
              initialValues={
                isLogin
                  ? { email: "", password: "" }
                  : { fullName: "", email: "", password: "", confirmPassword: "", role: "" }
              }
              validationSchema={isLogin ? loginSchema : signupSchema}
              onSubmit={isLogin ? handleLogin : handleSignup}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#070D0D]">
                          Full Name
                        </label>
                        <Field type="text" name="fullName" className="w-full p-2 bg-[#C8D8B4]" />
                        <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#070D0D]">Email</label>
                    <Field type="email" name="email" className="w-full p-2 bg-[#C8D8B4]" />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#070D0D]">Password</label>
                    <Field type="password" name="password" className="w-full p-2 bg-[#C8D8B4]" />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                  </div>

                  {isLogin && (
                    <div className="flex justify-end">
                      <p
                        className="text-sm text-[#355E62] cursor-pointer hover:underline"
                        onClick={() => router.push("/forgot-password")}
                      >
                        Forgot password?
                      </p>
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#070D0D]">
                          Confirm Password
                        </label>
                        <Field type="password" name="confirmPassword" className="w-full p-2 bg-[#C8D8B4]" />
                        <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#070D0D]">Role</label>
                        <div className="flex space-x-4 mt-1">
                          <label className="flex items-center space-x-1">
                            <Field type="radio" name="role" value="civilian" />
                            <span>Civilian</span>
                          </label>
                          <label className="flex items-center space-x-1">
                            <Field type="radio" name="role" value="corporative" />
                            <span>Corporate</span>
                          </label>
                        </div>
                        <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mx-auto block bg-[#355E62] text-white px-10 rounded-full hover:bg-[#2c4b4f] transition-all duration-300"
                  >
                    {isLogin ? "Login" : "Register"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
