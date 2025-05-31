import { Route, Routes } from "react-router-dom";
import Playground from "./pages/Playground";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-[#EBEBEF] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
              color: "#9333ea",
              fontWeight: "600",
              border: "1px solid #9333ea30",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
              color: "#ef4444",
              fontWeight: "600",
              border: "1px solid #ef444430",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
          },
        }}
      />
      <div className="flex-grow overflow-auto custom-scrollbar relative z-10">
        <Routes>
          <Route path="/" element={<Playground />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
