import { Route, Routes } from "react-router-dom";
import Playground from "./pages/Playground";
import { Toaster } from "react-hot-toast";
import clsx from "clsx";

const App = () => {
  return (
    <div
      className={clsx(
        "h-screen flex flex-col relative overflow-hidden",
        "bg-[var(--color-background)] text-[var(--color-foreground)]"
      )}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            className: clsx(
              "bg-[var(--color-card)] text-[var(--color-success)] font-semibold border border-[var(--color-border)] rounded-md"
            ),
          },
          error: {
            className: clsx(
              "bg-[var(--color-card)] text-[var(--color-destructive)] font-semibold border border-[var(--color-destructive-border)] rounded-xl shadow-lg"
            ),
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
