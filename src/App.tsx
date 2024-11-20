import { Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import AuthProtect from "./utils/AuthProtect";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Playground from "./pages/Playground";

const App = () => {
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-[#EBEBEF]">
      <Header />

      <div className="flex-grow overflow-auto">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <AuthProtect>
                <Profile />
              </AuthProtect>
            }
          />
          <Route path="/" element={<Playground />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
