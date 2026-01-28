import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Sleep from "./pages/Sleep";
import Meditation from "./pages/Meditation";
import Chat from "./pages/Chat";
import OpikMetrics from "./pages/OpikMetrics";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workout" element={<Workout />} />
            <Route path="sleep" element={<Sleep />} />
            <Route path="meditation" element={<Meditation />} />
            <Route path="chat" element={<Chat />} />
            <Route path="opik" element={<OpikMetrics />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
