import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import Contact from "./Contact";
import Logo from "./Logo";
import ParticlesBackground from "./ParticlesBackground.jsx";
import { AiOutlinePicture } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { FaBars, FaFile } from "react-icons/fa";
import { notification } from "antd"; // Import notification from Ant Design
import "../style.css";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, image, setId, setUserName } =useContext(UserContext);
  const divUnderMessages = useRef();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [newProfileImage, setNewProfileImage] = useState(null); // New image state



  // Handle opening modal
  const openModal = () => setIsModalOpen(true);
  
  // Handle closing modal
  const closeModal = () => setIsModalOpen(false);

  // Handle file selection for updating profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(URL.createObjectURL(file)); // Preview selected image
    }
  };

  // Handle profile image update
  const updateProfileImage = () => {
    if (newProfileImage) {
      console.log(newProfileImage)
      // setProfileImage(newProfileImage);
      closeModal(); // Close modal after updating
    }
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    connectToWs();

  }, [selectedUserId]);

  function connectToWs() {
    const ws = new WebSocket("wss://chatappback-9eg8.onrender.com");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectToWs();
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
      // Show notification when a new message is received
      if (messageData.sender !== id) {
        let notificationMessage = messageData.text || "You received a new file.";
        let description = messageData.text ? `Message: ${messageData.text}` : "";
        if (messageData.file) {
          description = `You received a new file. <a href="${messageData.file}" target="_blank">View File</a>`;
        }
  
        notification.open({
          message: `New message from ${username || "User"}`,
          description: (
            <div dangerouslySetInnerHTML={{ __html: description }} />
          ),
          placement: 'topRight',
        });
      }
  
      // Update message state and move sender to the top of the contact list
      if (
        messageData.sender === selectedUserId ||
        messageData.recipient === id
      ) {
        setMessages((prev) => [...prev, { ...messageData }]);
        reorderProfile(messageData.sender);
      }
    }
  }
  

  // Reorder profile to bring sender to the top
  function reorderProfile(senderId) {
    if (onlinePeople[senderId]) {
      setOnlinePeople((prev) => {
        const updatedPeople = { ...prev };
        const senderName = updatedPeople[senderId];
        delete updatedPeople[senderId];
        return { [senderId]: senderName, ...updatedPeople }; // Move sender to the top
      });
    } else if (offlinePeople[senderId]) {
      setOfflinePeople((prev) => {
        const updatedPeople = { ...prev };
        const sender = updatedPeople[senderId];
        delete updatedPeople[senderId];
        return { [senderId]: sender, ...updatedPeople }; // Move sender to the top
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
            file: URL.createObjectURL(blob), // Temporarily show the file URL
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
    }
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

      console.log(offlinePeople)
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

  return (
    <>
    {/* Profile Image Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4">Update Profile Image</h2>

          {/* Current or new image preview */}
          <div className="mb-4">
            <img
              src={newProfileImage || image}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full mx-auto"
            />
          </div>

          {/* File input to select new image */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />

          {/* Update and Cancel buttons */}
          <div className="flex justify-between">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={updateProfileImage}
            >
              Update
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    <ParticlesBackground />
    <div className="relative flex h-screen">
      {/* Hamburger Icon for small screens */}
      <button
        onClick={toggleSidebar}
        className="sm:hidden p-2 text-white absolute top-4 left-4 z-50"
      >
        <FaBars size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`flex flex-col user-field bg-[#291f3d] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-300 ease-in-out sm:w-1/3 w-full fixed sm:static h-full z-40`}
      >
        <div className="p-2 flex items-center justify-between bg-[#291f3d]">
          <span
            className="flex items-center gap-2 text-lg font-bold text-white"
            onClick={openModal} // Open modal on click
          >
            <img
              src={image}
              alt="Profile"
              className="w-16 h-16 rounded-full object-contain cursor-pointer"
            />
            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-gray-600 border rounded-sm"
          >
            Logout
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              userProfile={onlinePeopleExclOurUser[userId].profileImage}
              onClick={() => {
                setSelectedUserId(userId);
                setIsSidebarOpen(false); // Auto-close sidebar on user select
              }}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              profileImage={offlinePeople[userId].profileImage}
              onClick={() => {
                setSelectedUserId(userId);
                setIsSidebarOpen(false); // Auto-close sidebar on user select
              }}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex flex-col ${
          isSidebarOpen ? "hidden" : "flex"
        } w-full sm:w-2/3 p-2 chat-field h-full`}
      >
        <div className="flex-grow overflow-y-auto">
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={`${
                      message.sender === id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`text-left inline-block p-2 my-2 rounded-md text-sm ${
                        message.sender === id
                          ? "bg-[#9e81ff] text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {message.text}
                      {message.file && (
                        <a
                          href={message.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline block border-b"
                        >
                          {message.file.name}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2 p-2" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              className="bg-white border p-2 flex-grow rounded-sm text-black"
            />
            <label
              type="button"
              className="bg-gray-200 p-2 text-gray-600 rounded-sm cursor-pointer"
            >
              <input type="file" className="hidden" onChange={sendFile} />
              <FaFile />
            </label>
            <label
              type="button"
              className="bg-gray-200 p-2 text-gray-600 rounded-sm cursor-pointer"
            >
              <input type="file" className="hidden" onChange={sendFile} />
              <AiOutlinePicture />
            </label>
            <button
              type="submit"
              className="bg-[#7464cf] p-2 text-white rounded-sm"
            >
              <IoIosSend />
            </button>
          </form>
        )}
      </div>
    </div>
  </>
  );
}
