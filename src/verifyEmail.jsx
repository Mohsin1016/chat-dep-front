import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Loader from "./Loader";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Invalid or missing token.");
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/verify-email?token=${token}`);
        if (response.status === 200) {
          setMessage(response.data.message || "Email successfully verified.");
          setIsError(false);
        } else {
          setMessage("Unexpected response from the server.");
          setIsError(true);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.error ||
            "An error occurred during email verification."
        );
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95"
      >
        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader color="#a30e46" size={15} speedMultiplier={0.8} />
              <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Verifying your email...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                {isError ? (
                  <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h1 className={`text-2xl font-bold mb-4 ${
                isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              }`}>
                {isError ? "Verification Failed" : "Verification Successful"}
              </h1>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">{message}</p>
              
              {!isError && (
                <motion.div 
                  className="mt-8"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Proceed to Login
                  </Link>
                </motion.div>
              )}
              
              {isError && (
                <motion.div 
                  className="mt-8"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                  >
                    Return to Homepage
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        <ToastContainer position="top-center" />
      </motion.div>
    </div>
  );
}
