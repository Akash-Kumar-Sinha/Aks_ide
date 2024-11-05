import React from "react";
import MobileExplorer from "./MobileExplorer";

const SideBar = () => {
  return (
    <div className="h-full w-10 lg:w-12 text-sm bg-[#18181B] flex flex-col text-center p-1">
      Side Bar
      <MobileExplorer/>
    </div>
  );
};

export default SideBar;
