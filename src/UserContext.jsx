import axios from "axios";
import { createContext, useEffect, useState } from "react";

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
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider
      value={{ username, setUserName, id, setId, image, setImage }}
    >
      {children}
    </UserContext.Provider>
  );
}
