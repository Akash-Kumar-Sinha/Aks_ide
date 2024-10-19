import { Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AuthProtect from "./utils/AuthProtect";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <div className="h-screen bg-zinc-950 text-zinc-100">
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
  );
};

export default App;
