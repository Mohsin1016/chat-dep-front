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
import { notification } from "antd";
import "../style.css";

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
      console.log(newProfileImage);
      closeModal();
    }
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:8000/");
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
      if (messageData.sender !== id) {
        let notificationMessage =
          messageData.text || "You received a new file.";
        let description = messageData.text
          ? `Message: ${messageData.text}`
          : "";
        if (messageData.file) {
          description = `You received a new file. <a href="${messageData.file}" target="_blank">View File</a>`;
        }

        notification.open({
          message: `New message from ${username || "User"}`,
          description: (
            <div dangerouslySetInnerHTML={{ __html: description }} />
          ),
          placement: "topRight",
        });
      }

      if (
        messageData.sender === selectedUserId ||
        messageData.recipient === id
      ) {
        setMessages((prev) => [...prev, { ...messageData }]);
        reorderProfile(messageData.sender);
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
    const response = axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUserName(null);
    });

    console.log("logout 🎈🎈🎈", response);
  }

  function sendMessage(ev, file = null, blob = false) {
    if (ev) ev.preventDefault();
    console.log("✉️ Preparing to send a message...");

    const message = {
      recipient: selectedUserId,
      text: newMessageText,
      file,
    };

    try {
      ws.send(JSON.stringify(message));
      console.log("✅ Message sent over WebSocket:", message);

      if (file) {
        console.log("📁 File detected, preparing file-specific message.");
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
        console.log("🖼️ File added to messages:", file);
      } else {
        console.log("📝 Text message, clearing input field.");
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
      console.log("📬 Message added to local state.");
    } catch (error) {
      console.error("❌ Error sending message:", error);
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
    console.log("📂 File input event triggered");
    const file = ev.target.files[0];

    if (file) {
      console.log(
        `📄 File selected: ${file.name} (type: ${file.type}, size: ${file.size} bytes)`
      );
      const reader = new FileReader();

      reader.onloadend = () => {
        console.log("✅ File reading completed");
        const base64 = reader.result;
        console.log("📤 Base64 data generated");

        const blob = convertBase64ToBlob(base64, file.type);
        console.log("🔄 Converted Base64 to Blob");

        sendMessage(
          null,
          {
            name: ev.target.files[0].name,
            data: reader.result,
          },
          blob
        );
        console.log("✉️ File data sent via sendMessage");
      };
      reader.readAsDataURL(file);
      console.log("📖 Started reading file as Data URL");
    } else {
      console.log("⚠️ No file selected");
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

      console.log(offlinePeople);
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

  console.log("messages without 🫠🫠🫠", messagesWithoutDupes);

  return (
    <>
      {/* Profile Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full relative">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">
              Update Profile Image
            </h2>

            {/* Current or new image preview */}
            <div className="mb-6">
              <img
                src={newProfileImage || image}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-blue-500"
              />
            </div>

            {/* File input to select new image */}
            <label className="block mb-6">
              <span className="block text-sm font-medium text-gray-700">
                Select an image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>

            {/* Update and Cancel buttons */}
            <div className="flex justify-between items-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={updateProfileImage}
              >
                Update
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
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
                            {message.file}
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
