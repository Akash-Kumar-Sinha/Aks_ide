import React from "react";
import { Link } from "react-router-dom";

import Repo from "@/components/Repo/Repo";
import RepoData from "@/components/Repo/RepoData";
import useUserProfile from "@/utils/useUserProfile";

const Home = () => {
  const { userProfile, loading } = useUserProfile();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen w-full px-4">
      {!userProfile && (
        <div className="mb-6 text-center -mt-8">
          <Link to="/" className="text-blue-400 hover:underline">
            Not logged in. Please log in to access all features.
          </Link>
        </div>
      )}
      <div className="flex justify-center items-start">
        <div className="w-full max-w-5xl flex flex-wrap">
          {RepoData.map((repo, index) => (
            <Repo
              key={index}
              label={repo.label}
              description={repo.description}
              refLink={repo.refLink}
              title={repo.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
