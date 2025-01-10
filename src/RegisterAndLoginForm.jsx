import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import "../style.css";
import { toast, ToastContainer } from "react-toastify";
import { TailSpin } from "react-loader-spinner";

import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedInOrRegister, setIsLoggedInOrRegister] = useState("register");
  const {
    setUserName: setLogedInUsername,
    setId,
    setImage: setProfileImage,
  } = useContext(UserContext);

  const restrictedWords = ["admin", "test", "password", "123"];

  const isValidGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Form submission started");
    setIsLoading(true);

    if (isLoggedInOrRegister === "register") {
      console.log("🔐 Register flow detected");
      if (!isValidGmail(email)) {
        console.log("❌ Invalid email detected");
        toast.error("Only Gmail addresses are allowed.");
        setIsLoading(false);
        return;
      }
    } else {
      console.log("🔓 Login flow detected");
    }

    try {
      const url = isLoggedInOrRegister === "register" ? "/register" : "/login";
      let response;

      if (isLoggedInOrRegister === "register") {
        console.log("📤 Preparing registration data");
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("email", email);

        if (image) {
          console.log("📸 Adding profile image to form data");
          formData.append("profileImage", image);
        }

        response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Registration request sent");

        if (response.status === 200 || response.status === 201) {
          console.log("🎉 Registration successful");
          toast.info("Please verify your email to complete registration.");
          setIsLoggedInOrRegister("login");
        } else {
          console.log("⚠️ Unexpected response status:", response.status);
          toast.error("Unexpected response status: " + response.status);
        }
      } else {
        console.log("📤 Sending login request");
        response = await axios.post(url, { username, password });

        if (response.status === 200 || response.status === 201) {
          console.log("🎉 Login successful");
          toast.success("Login successful");
          setLogedInUsername(username);
          setId(response.data.id || null);
          setProfileImage(response.data.userProfile || null);
        } else {
          console.log("⚠️ Unexpected response status:", response.status);
          toast.error("Unexpected response status: " + response.status);
        }
      }
    } catch (error) {
      console.log("❌ Error occurred during request", error);

      if (error.response && error.response.data && error.response.data.error) {
        console.log("💡 Backend error:", error.response.data.error);
        toast.error("Error: " + error.response.data.error);
      } else {
        console.log("💡 Frontend or network error:", error.message);
        toast.error("Error:" + error.message);
      }
    } finally {
      console.log("🏁 Form submission finished");
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsLoggedInOrRegister("login");
  };

  const handleRegisterClick = () => {
    setIsLoggedInOrRegister("register");
  };

  return (
    <div className="background-Login">
      <div className="container">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm blur-background">
          <form
            className="space-y-6 blur-content"
            onSubmit={handleSubmit}
            method="POST"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  value={username}
                  onChange={(ev) => setUserName(ev.target.value)}
                  type="text"
                  placeholder="Username"
                  required
                  className="block w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {isLoggedInOrRegister === "register" && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    type="text"
                    placeholder="Email"
                    required
                    className="block w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  type="password"
                  placeholder="Password"
                  required
                  className="block w-full rounded-md p-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {isLoggedInOrRegister === "register" && (
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Upload Profile Image
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    accept="image/*"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              {isLoading ? (
                <div className="flex justify-center">
                  <TailSpin
                    height="50"
                    width="50"
                    color="#4fa94d"
                    ariaLabel="loading"
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#a30e46] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#2e1e3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {isLoggedInOrRegister === "register" ? "Register" : "Login"}
                </button>
              )}
            </div>

            <div className="text-center mt-3">
              {isLoggedInOrRegister === "register" && (
                <div>
                  Already a member?{" "}
                  <button onClick={handleLoginClick}>login here</button>{" "}
                </div>
              )}
              {isLoggedInOrRegister === "login" && (
                <div>
                  Don't have an account?{" "}
                  <button onClick={handleRegisterClick}>Register here</button>{" "}
                </div>
              )}
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}
