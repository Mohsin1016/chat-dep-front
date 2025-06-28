import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import Contact from "./Contact";
import Logo from "./Logo";
import ParticlesBackground from "./ParticlesBackground.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoIosSend, 
  IoMdClose,
  IoMdSettings,
  IoMdLogOut,
  IoMdImages,
  IoMdAttach,
  IoMdSearch,
  IoMdMore
} from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { notification } from "antd";
import "../style.css";

const processedMessageIds = new Set();

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, image, setId, setUserName } = useContext(UserContext);
  const divUnderMessages = useRef();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const displayedMessageIds = useRef(new Set());

  // Find the selected user
  const selectedUser = selectedUserId && (
    onlinePeople[selectedUserId] ? 
    { username: onlinePeople[selectedUserId], online: true } : 
    { username: offlinePeople[selectedUserId]?.username, online: false, profileImage: offlinePeople[selectedUserId]?.profileImage }
  );

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(URL.createObjectURL(file));
    }
  };

  const updateProfileImage = () => {
    if (newProfileImage) {
      // Here you would implement the API call to update the profile image
      console.log(newProfileImage);
      closeModal();
      notification.success({
        message: "Success",
        description: "Profile image updated successfully!",
        placement: "topRight",
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Clear any existing connection before creating a new one
    if (ws) {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    }
    connectToWs();
    
    // Cleanup when component unmounts
    return () => {
      if (ws) {
        ws.removeEventListener("message", handleMessage);
        ws.close();
      }
    };
  }, [selectedUserId]); // Add ws to the dependency array

  function connectToWs() {
    const wsConnection = new WebSocket("ws://localhost:8000/");
    setWs(wsConnection);
    
    // Use a reference to the specific connection instance
    const messageHandler = (ev) => handleMessage(ev);
    wsConnection.addEventListener("message", messageHandler);
    
    wsConnection.addEventListener("close", () => {
      setTimeout(() => {
        if (wsConnection === ws) { // Only reconnect if this is still the current connection
          connectToWs();
        }
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if (messageData.text || messageData.file) {
      // Check if we've already processed this message ID
      const messageId = messageData._id || JSON.stringify(messageData);
      if (!processedMessageIds.has(messageId)) {
        processedMessageIds.add(messageId);
        
        // Show notification only once per message
        if (messageData.sender !== id) {
          let notificationMessage = messageData.text || "You received a new file.";
          let description = messageData.text ? `Message: ${messageData.text}` : "";
          if (messageData.file) {
            description = `You received a new file. <a href="${messageData.file}" target="_blank">View File</a>`;
          }

          notification.open({
            message: `New message from ${messageData.senderName || "User"}`,
            description: (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ),
            placement: "topRight",
          });
        }

        if (messageData.sender === selectedUserId || messageData.recipient === id) {
          setMessages((prev) => [...prev, { ...messageData }]);
          reorderProfile(messageData.sender);
        }
        
        // Limit the size of the set to prevent memory leaks
        if (processedMessageIds.size > 100) {
          const iterator = processedMessageIds.values();
          processedMessageIds.delete(iterator.next().value);
        }
      }
    }
  }

  function reorderProfile(senderId) {
    if (onlinePeople[senderId]) {
      setOnlinePeople((prev) => {
        const updatedPeople = { ...prev };
        const senderName = updatedPeople[senderId];
        delete updatedPeople[senderId];
        return { [senderId]: senderName, ...updatedPeople };
      });
    } else if (offlinePeople[senderId]) {
      setOfflinePeople((prev) => {
        const updatedPeople = { ...prev };
        const sender = updatedPeople[senderId];
        delete updatedPeople[senderId];
        return { [senderId]: sender, ...updatedPeople };
      });
    }
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUserName(null);
    });
  }

  function sendMessage(ev, file = null, blob = false) {
    if (ev) ev.preventDefault();

    const message = {
      recipient: selectedUserId,
      text: newMessageText,
      file,
    };

    try {
      ws.send(JSON.stringify(message));

      if (file) {
        setMessages((prev) => [
          ...prev,
          {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            file: URL.createObjectURL(blob),
            _id: Date.now(),
          },
        ]);
      } else {
        setNewMessageText("");
        setMessages((prev) => [
          ...prev,
          {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      notification.error({
        message: "Error",
        description: "Failed to send message. Please try again.",
        placement: "topRight",
      });
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function convertBase64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  function sendFile(ev) {
    const file = ev.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result;
        const blob = convertBase64ToBlob(base64, file.type);

        sendMessage(
          null,
          {
            name: ev.target.files[0].name,
            data: reader.result,
          },
          blob
        );
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  // Filter contacts based on search query
  const filteredOnlinePeople = Object.entries(onlinePeopleExclOurUser)
    .filter(([_, name]) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .reduce((obj, [id, name]) => ({...obj, [id]: name}), {});
  
  const filteredOfflinePeople = Object.entries(offlinePeople)
    .filter(([_, user]) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .reduce((obj, [id, user]) => ({...obj, [id]: user}), {});

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        // On desktop, always show sidebar
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <ParticlesBackground />
      
      {/* Profile Image Modal */}
      <AnimatePresence>
      {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full relative"
            >
              <button 
                onClick={closeModal} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoMdClose size={24} />
              </button>
              
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white text-center">
              Update Profile Image
            </h2>

            <div className="mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-32 h-32 mx-auto"
                >
              <img
                src={newProfileImage || image}
                alt="Profile Preview"
                    className="w-full h-full object-cover rounded-full border-4 border-indigo-500 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300">
                    <label className="cursor-pointer p-2 bg-white bg-opacity-0 hover:bg-opacity-80 rounded-full">
                      <IoMdImages size={28} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                        className="hidden"
              />
            </label>
                  </div>
                </motion.div>
              </div>

            <div className="flex justify-between items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-md"
                onClick={updateProfileImage}
              >
                Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg shadow-md"
                onClick={closeModal}
              >
                Cancel
                </motion.button>
            </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

      <div className="relative flex h-screen">
        {/* Hamburger Icon for small screens */}
        <button
          onClick={toggleSidebar}
          className="sm:hidden p-4 text-white absolute top-2 left-2 z-50 bg-indigo-600 rounded-lg shadow-lg"
        >
          <FaBars size={24} />
        </button>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ 
            x: isSidebarOpen || window.innerWidth >= 640 ? 0 : "-100%"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col bg-[#191627] sm:translate-x-0 h-full z-40 sm:w-1/3 w-3/4 max-w-xs"
        >
          <div className="p-4 flex items-center justify-between bg-[#242038] rounded-b-lg shadow-md">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center gap-3"
            >
              <img
                src={image}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-indigo-400 shadow-lg"
              />
              <span className="font-bold text-white text-lg">{username}</span>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openModal}
                className="p-2 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800 rounded-full"
                aria-label="Settings"
              >
                <IoMdSettings size={22} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              onClick={logout}
                className="p-2 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800 rounded-full"
                aria-label="Logout"
              >
                <IoMdLogOut size={22} />
              </motion.button>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2d2850] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <IoMdSearch className="absolute top-3 left-3 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
            <Logo />
            
            {Object.keys(filteredOnlinePeople).length > 0 && (
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Online Contacts</h3>
              </div>
            )}
            
            {Object.keys(filteredOnlinePeople).map((userId) => (
              <motion.div
                key={userId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Contact
                id={userId}
                online={true}
                  username={filteredOnlinePeople[userId]}
                  userProfile={filteredOnlinePeople[userId].profileImage}
                onClick={() => {
                  setSelectedUserId(userId);
                    setIsSidebarOpen(false);
                }}
                selected={userId === selectedUserId}
              />
              </motion.div>
            ))}
            
            {Object.keys(filteredOfflinePeople).length > 0 && (
              <div className="px-4 py-2 mt-2">
                <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Offline Contacts</h3>
              </div>
            )}
            
            {Object.keys(filteredOfflinePeople).map((userId) => (
              <motion.div
                key={userId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Contact
                id={userId}
                online={false}
                  username={filteredOfflinePeople[userId].username}
                  profileImage={filteredOfflinePeople[userId].profileImage}
                onClick={() => {
                  setSelectedUserId(userId);
                    setIsSidebarOpen(false);
                }}
                selected={userId === selectedUserId}
              />
              </motion.div>
            ))}
            
            {Object.keys(filteredOnlinePeople).length === 0 && 
             Object.keys(filteredOfflinePeople).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No contacts found
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div className="flex flex-col flex-grow h-full bg-gradient-to-br from-[#1a1634] to-[#2d1a45] text-white">
            {!selectedUserId && (
              <div className="flex h-full items-center justify-center">
              <div className="text-center p-8 bg-white bg-opacity-5 backdrop-blur-md rounded-xl shadow-xl">
                <div className="mb-4">
                  <img 
                    src="/chat-illustration.svg" 
                    alt="Select a chat" 
                    className="w-48 h-48 mx-auto opacity-70"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-6xl text-center mb-4">💬</div>
                </div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-2">
                  Welcome to Mohsin Messenger
                </h3>
                <p className="text-gray-400">
                  Select a contact from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
          
          {selectedUserId && (
            <>
              {/* Chat Header */}
              <div className="flex items-center p-4 border-b border-gray-700 bg-[#242038]">
                <div className="flex items-center flex-grow">
                  <div className="relative">
                    {selectedUser && (
                      <img
                        src={(selectedUser?.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.username)}`}
                        alt="Contact"
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400"
                      />
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#242038] ${selectedUser?.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{selectedUser?.username}</div>
                    <div className="text-xs text-gray-400">{selectedUser?.online ? 'Online' : 'Offline'}</div>
                  </div>
                </div>
                <div className="flex">
                  <button className="p-2 rounded-full hover:bg-[#2d2850]">
                    <IoMdSearch size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-[#2d2850]">
                    <IoMdMore size={20} />
                  </button>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
                <div className="space-y-4">
                  {messagesWithoutDupes.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender === id
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-[#2d2850] text-white rounded-bl-none"
                        }`}
                      >
                        {message.text && <p>{message.text}</p>}
                        {message.file && (
                          <div className="mt-2">
                          <a
                            href={message.file}
                            target="_blank"
                            rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-black bg-opacity-20 rounded-md hover:bg-opacity-30 transition-all"
                          >
                              <IoMdAttach size={18} />
                              <span className="underline text-sm">
                                {message.file.split("/").pop() || "Attached File"}
                              </span>
                          </a>
                          </div>
                        )}
                        <span className="block text-xs text-right mt-1 opacity-70">
                          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={divUnderMessages}></div>
                </div>
              </div>
              
              {/* Message Input Area */}
              <form 
                className="p-4 bg-[#1a1435] border-t border-gray-800 flex items-center gap-2" 
                onSubmit={sendMessage}
              >
              <input
                type="text"
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-[#2d2850] text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                type="button"
                  className="p-2 bg-[#2d2850] text-indigo-300 rounded-full hover:bg-indigo-700 hover:text-white transition-all"
                  onClick={triggerFileInput}
                >
                  <IoMdAttach size={20} />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={sendFile}
                    ref={fileInputRef}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                type="submit"
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all"
                  disabled={!newMessageText.trim() && !selectedUserId}
              >
                  <IoIosSend size={20} />
                </motion.button>
            </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
