"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { forgotPassword } from "../../lib/user"; 

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const schema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setMessage("");
    setError("");
    try {
      const res = await forgotPassword(values.email); 
      setMessage("Reset token generated successfully!");

      console.log("Reset token (for dev):", res.reset_token); 
    
      router.push(`/reset-password?token=${res.reset_token}`);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#ECF1E6]">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] rounded-2xl p-8"
      >
        <h1 className="text-2xl font-bold text-center text-[#355E62] mb-4">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to request a password reset link.
        </p>

        {message && <div className="text-green-600 text-center mb-4">{message}</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#070D0D]">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 bg-[#C8D8B4]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto block bg-[#355E62] text-white px-6 rounded-full hover:bg-[#2c4b4f] transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : "Send Reset Token"}
              </button>

              <p
                className="text-sm text-[#355E62] text-center mt-2 cursor-pointer hover:underline"
                onClick={() => router.push("/auth")}
              >
                Back to login
              </p>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;