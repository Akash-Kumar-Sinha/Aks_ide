import { Link, useParams } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";

import CodeEditor from "@/components/Repo/CodeEditor";
import Terminal from "@/components/Repo/Terminal";

const RepoEditor = () => {
  const { repoId } = useParams();

  return (
    <div className="min-h-screen p-2 px-4 flex flex-col gap-3">
      <header className="flex justify-between text-blue-400">
        <Link to="/home">
          <IoReturnUpBackOutline size={27} />
        </Link>
        <p className="hover:underline hover:cursor-pointer">Id: {repoId}</p>
      </header>
      <div className="p-2 h-full border border-white">
        <CodeEditor />
        <Terminal />
      </div>
    </div>
  );
};

export default RepoEditor;
