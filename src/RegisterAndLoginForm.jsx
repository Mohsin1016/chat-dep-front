import React, { useState, useContext, useMemo, useCallback } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import "../style.css";
import { toast, ToastContainer } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

// Move particles outside the component to prevent re-creation on each render
const AnimatedParticles = React.memo(() => {
  // Pre-generate random positions for particles
  const particles = useMemo(() => 
    Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 10 + 5}px`,
      duration: Math.random() * 10 + 10,
      yOffset: Math.random() * -100 - 50,
    })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-0"
    >
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white bg-opacity-20"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, particle.yOffset],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
});

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

  // Memoize event handlers
  const handleUsernameChange = useCallback((ev) => setUserName(ev.target.value), []);
  const handleEmailChange = useCallback((ev) => setEmail(ev.target.value), []);
  const handlePasswordChange = useCallback((ev) => setPassword(ev.target.value), []);
  const handleImageChange = useCallback((e) => setImage(e.target.files[0]), []);
  
  const handleLoginClick = useCallback(() => {
    setIsLoggedInOrRegister("login");
  }, []);

  const handleRegisterClick = useCallback(() => {
    setIsLoggedInOrRegister("register");
  }, []);

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

  // Memoize animation variants
  const variants = useMemo(() => ({
    containerVariants: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: 0.5,
          when: "beforeChildren",
          staggerChildren: 0.2
        } 
      }
    },
    itemVariants: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    buttonVariants: {
      hover: { 
        scale: 1.05,
        boxShadow: "0px 0px 8px rgb(163, 14, 70, 0.5)",
        transition: { duration: 0.3 }
      },
      tap: { scale: 0.95 }
    },
    switchVariants: {
      hover: { 
        color: "#a30e46",
        transition: { duration: 0.2 } 
      }
    }
  }), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
      <AnimatedParticles />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white border-opacity-20"
          variants={variants.containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-8"
            variants={variants.itemVariants}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLoggedInOrRegister === "register" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-purple-200">
              {isLoggedInOrRegister === "register" 
                ? "Sign up to start chatting with friends" 
                : "Sign in to continue chatting"}
            </p>
          </motion.div>

          <form className="space-y-6" onSubmit={handleSubmit} method="POST">
            <motion.div variants={variants.itemVariants}>
              <label className="block text-sm font-medium leading-6 text-purple-200 mb-1">
                Username
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                value={username}
                onChange={handleUsernameChange}
                type="text"
                placeholder="Enter your username"
                required
                className="block w-full p-3 rounded-lg border border-purple-300 border-opacity-30 bg-white bg-opacity-10 text-white placeholder-purple-300 placeholder-opacity-70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </motion.div>

            {isLoggedInOrRegister === "register" && (
              <motion.div variants={variants.itemVariants}>
                <label className="block text-sm font-medium leading-6 text-purple-200 mb-1">
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  value={email}
                  onChange={handleEmailChange}
                  type="text"
                  placeholder="youremail@gmail.com"
                  required
                  className="block w-full p-3 rounded-lg border border-purple-300 border-opacity-30 bg-white bg-opacity-10 text-white placeholder-purple-300 placeholder-opacity-70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </motion.div>
            )}

            <motion.div variants={variants.itemVariants}>
              <label className="block text-sm font-medium leading-6 text-purple-200 mb-1">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                value={password}
                onChange={handlePasswordChange}
                type="password"
                placeholder="••••••••"
                required
                className="block w-full p-3 rounded-lg border border-purple-300 border-opacity-30 bg-white bg-opacity-10 text-white placeholder-purple-300 placeholder-opacity-70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </motion.div>

            {isLoggedInOrRegister === "register" && (
              <motion.div variants={variants.itemVariants}>
                <label className="block text-sm font-medium leading-6 text-purple-200 mb-1">
                  Profile Image
                </label>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 flex justify-center rounded-lg border border-dashed border-purple-300 border-opacity-50 p-6 bg-white bg-opacity-5"
                >
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-purple-200">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-300 hover:text-indigo-200 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={handleImageChange} 
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-purple-300">PNG, JPG, GIF up to 10MB</p>
                    {image && (
                      <p className="text-xs text-green-300 mt-2">
                        ✓ {typeof image === 'object' ? image.name : 'Image selected'}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            <motion.div variants={variants.itemVariants}>
              {isLoading ? (
                <div className="flex justify-center p-2">
                  <TailSpin
                    height="40"
                    width="40"
                    color="#ffffff"
                    ariaLabel="loading"
                  />
                </div>
              ) : (
                <motion.button
                  variants={variants.buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium shadow-lg"
                >
                  {isLoggedInOrRegister === "register" ? "Create Account" : "Sign In"}
                </motion.button>
              )}
            </motion.div>
          </form>

          <motion.div 
            className="text-center mt-6 text-purple-200"
            variants={variants.itemVariants}
          >
            {isLoggedInOrRegister === "register" ? (
              <div>
                Already have an account?{" "}
                <motion.button
                  variants={variants.switchVariants}
                  whileHover="hover"
                  onClick={handleLoginClick}
                  className="font-medium text-white hover:underline focus:outline-none"
                >
                  Sign in
                </motion.button>
              </div>
            ) : (
              <div>
                New to Mohsin Messenger?{" "}
                <motion.button
                  variants={variants.switchVariants}
                  whileHover="hover"
                  onClick={handleRegisterClick}
                  className="font-medium text-white hover:underline focus:outline-none"
                >
                  Create an account
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
