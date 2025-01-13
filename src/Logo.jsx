import { IoIosChatboxes } from "react-icons/io";
export default function Logo() {
  return (
    <div className="flex gap-3 text-[#a30e46] font-bold p-5 text-lg">
      <IoIosChatboxes className="w-8 h-8" />
      <span className="text-xl text-white">Mohsin Messenger</span>
    </div>
  );
}
