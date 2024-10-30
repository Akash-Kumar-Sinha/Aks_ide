import { Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AuthProtect from "./utils/AuthProtect";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import RepoEditor from "./pages/CodeEditor";

const App = () => {
  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <AuthProtect>
        <Header />
      </AuthProtect>

      <div className="mt-14">
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
          <Route
            path={`/repo/:repoId`}
            element={
              <AuthProtect>
                <RepoEditor />
              </AuthProtect>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
