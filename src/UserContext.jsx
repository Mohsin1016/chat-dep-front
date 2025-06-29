import axios from "axios";
import { createContext, useEffect, useState } from "react";
import Loader from "./Loader"; // Import our Loader component

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUserName] = useState(null);
  const [id, setId] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("profile fetching...");
      
      try {
        const response = await axios.get("/profile", {
          withCredentials: true  // This will send cookies with the request
        });

        console.log("Profile response:", response.data);
        setId(response.data.userId);
        setUserName(response.data.username);
        setImage(response.data.profileImage);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    // Replace simple text with our loader component
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
        <Loader size={20} color="#a30e46" speedMultiplier={0.8} />
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ username, setUserName, id, setId, image, setImage }}
    >
      {children}
    </UserContext.Provider>
  );
}
