"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../lib/user";

// Wrapper with Suspense
export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-20">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please request a new one.");
    }
  }, [token]);

  const schema = Yup.object({
    newPassword: Yup.string().min(6, "At least 6 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    try {
      await resetPassword(token, values.newPassword);
      setSuccess("Password successfully reset! Redirecting to login...");
      setTimeout(() => router.push("/auth"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
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
          Reset Password
        </h1>
        {success && <div className="text-green-600 text-center mb-4">{success}</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#070D0D]">
                  New Password
                </label>
                <Field
                  type="password"
                  name="newPassword"
                  className="w-full p-2 bg-[#C8D8B4]"
                />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#070D0D]">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="w-full p-2 bg-[#C8D8B4]"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="mx-auto block bg-[#355E62] text-white px-6 rounded-full hover:bg-[#2c4b4f] transition-all duration-300"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
}
