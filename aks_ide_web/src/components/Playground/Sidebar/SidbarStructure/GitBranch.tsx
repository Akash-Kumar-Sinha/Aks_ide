import { FaGithub } from "react-icons/fa";

const GitBranch = () => {
  return (
    <div className="h-full bg-[#0d1117] flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <FaGithub className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Git Integration
        </h3>
        <p className="text-zinc-400 text-sm">
          Git functionality will be available soon
        </p>
      </div>
    </div>
  );
};

export default GitBranch;
