import { useState } from "react";
import Loader from "./Loader";

export default function Avatar({ online, username, userId, profileImage }) {
  const [imageLoading, setImageLoading] = useState(true);
  
  // Ensure userId is defined and has the expected format
  if (!userId || typeof userId !== 'string') {
    return null; // or render a placeholder/avatar indicating missing user
  }

  const colors = [
    'bg-[#FF00FF]', 'bg-[#808080]', 'bg-[#00FF00]', 
    'bg-[#00FFFF]', 'bg-blue-200', 'bg-yellow-200', 
    'bg-orange-200', 'bg-pink-200', 'bg-fuchsia-200', 'bg-rose-200'
  ];
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={"w-8 h-8 relative rounded-full flex items-center justify-center "+color }>
      {profileImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader size={5} margin={1} />
            </div>
          )}
          <img
            src={profileImage}
            alt={`${username}'s profile`}
            className="w-full h-full rounded-full object-contain"
            style={{ display: imageLoading ? "none" : "block" }}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </>
      ) : (
        // Display the first letter of the username if no profile image exists
        <div className="text-center w-full opacity-70 text-white">
          {username ? username[0] : '?'}
        </div>
      )}
      {online ? (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      ) : (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}
