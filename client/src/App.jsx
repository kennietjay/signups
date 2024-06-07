import { MeetingProvider } from "./components/contexts/Meeting";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <div>
      <MeetingProvider>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MeetingProvider>
    </div>
  );
}

export default App;
