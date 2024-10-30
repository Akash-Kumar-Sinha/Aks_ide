import { Link } from "react-router-dom";
import Repo from "@/components/Repo/Repo";
import useUserProfile from "@/utils/useUserProfile";
import Loading from "@/components/Loading";

const Home = () => {
  const { userProfile, loading } = useUserProfile();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 px-4">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Loading size={48} />
          <p className="mt-4 text-gray-300 text-lg">Loading your profile...</p>
        </div>
      ) : (
        <>
          {!userProfile && (
            <div className="mb-6 text-center -mt-8">
              <Link to="/" className="text-blue-400 hover:underline">
                Not logged in. Please log in to access all features.
              </Link>
            </div>
          )}
          <div className="flex justify-center items-start w-full max-w-5xl flex-wrap">
            <Repo />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
