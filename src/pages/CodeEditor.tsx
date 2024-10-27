import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";

import Editor from "@/components/Repo/Editor";
import Terminal from "@/components/Repo/Terminal";
import { socket } from "@/utils/Socket";

const CodeEditor = () => {
  const { repoId } = useParams();

  const location = useLocation();

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });
  }, []);

  return (
    <div className="min-h-screen px-4 flex flex-col">
      <header className="pb-2 flex justify-between text-blue-400">
        <Link to="/home">
          <IoReturnUpBackOutline size={27} />
        </Link>
        <p className="hover:underline hover:cursor-pointer">Id: {repoId}</p>
      </header>
      <div className="flex flex-col">
        <Editor />
        <Terminal name={location.state.name}/>
      </div>
    </div>
  );
};

export default CodeEditor;
