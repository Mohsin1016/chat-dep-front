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
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(";").shift();
          return null;
        }

        const token = getCookie("token");
        // console.log("token 🍇🍇", token);

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log("🦀🦀🦀 response in prifile ", response.data);
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
