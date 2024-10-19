import React from "react";

import Repo from "@/components/Repo/Repo";
import RepoData from "@/components/Repo/RepoData";

const Home = () => {
  return (
    <div className="min-h-screen w-full flex justify-center items-start">
      <div className="w-full max-w-5xl flex flex-wrap">
        {RepoData.map((repo, index) => (
          <Repo key={index} label={repo.label} description={repo.description} refLink={repo.refLink} title={repo.title}/>
        ))}
      </div>
    </div>
  );
};

export default Home;
