"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
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
    role: Yup.string().required("Please select a role"),
  });

  const handleLogin = (values) => {
    if (values.email.includes("corp")) {
      router.push("/corporate");
    } else {
      router.push("/civilian");
    }
  };

  const handleSignup = (values) => {
    console.log("Registered:", values);
    alert("Signup successful!");
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth-bg.jpeg')" }}
      ></div>
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-green-500">
        <h1 className="text-4xl font-bold text mb-2">Eco-Collect</h1>
        <p className="text-gray-500 mb-8 text-center">
          Connecting citizens and corporations for a circular economy.
        </p>
        <div className="flex mb-8 bg-gray-200 rounded-full p-1 w-64 relative">
          <motion.div
            layout
            className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-full bg-green-600 transition-all duration-300 ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          />
          <button
            className={`flex-1 z-10 text-center font-semibold ${
              isLogin ? "text-white" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 z-10 text-center font-semibold ${
              !isLogin ? "text-white" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>
        <Formik
          initialValues={
            isLogin
              ? { email: "", password: "" }
              : {
                  fullName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  role: "",
                }
          }
          validationSchema={isLogin ? loginSchema : signupSchema}
          onSubmit={isLogin ? handleLogin : handleSignup}
        >
          {({ values, handleChange }) => (
            <Form className="w-80 space-y-4">
              {isLogin ? (
                <>
                  <div>
                    <label>Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label>Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <p
                    className="text-sm text-green-700 cursor-pointer hover:underline"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot password?
                  </p>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label>Full Name</label>
                    <Field
                      type="text"
                      name="fullName"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="fullName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label>Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label>Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label>Confirm Password</label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label>Role</label>
                    <div className="flex space-x-4 mt-1">
                      <label>
                        <Field type="radio" name="role" value="civilian" />
                        Civilian
                      </label>
                      <label>
                        <Field type="radio" name="role" value="corporate" />
                        Corporate
                      </label>
                    </div>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Register
                  </button>
                </>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
