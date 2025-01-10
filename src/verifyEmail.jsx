import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="text-center">
          {isLoading ? (
            <div className="flex justify-center">
              <TailSpin height="50" width="50" color="#4fa94d" ariaLabel="loading" />
            </div>
          ) : (
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {isError ? "Verification Failed" : "Verification Successful"}
              </h1>
              <p className="mt-4 text-gray-700">{message}</p>
              {!isError && (
                <a
                  href="/login"
                  className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Go to Login
                </a>
              )}
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
