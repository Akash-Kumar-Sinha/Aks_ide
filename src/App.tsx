import { Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import AuthProtect from "./utils/AuthProtect";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Playground from "./pages/Playground";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-[#EBEBEF]">
      <Header />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "black",
              color: "#8E24AA",
              fontWeight: "bold",
            },
          },
          error: {
            style: {
              background: "black",
              color: "#8E24AA",
              fontWeight: "bold",
            },
          },
        }}
      />
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
