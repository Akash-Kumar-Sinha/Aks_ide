import { Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AuthProtect from "./utils/AuthProtect";
import Profile from "./pages/Profile";
import Header from "./components/Header";

const App = () => {
  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
      <AuthProtect>
        <Header />
      </AuthProtect>

      <div className="flex-grow mt-16">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/home"
            element={
              <AuthProtect>
                <Home />
              </AuthProtect>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthProtect>
                <Profile />
              </AuthProtect>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
