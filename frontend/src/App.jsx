import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateElection from "./pages/admin/CreateElection";
import CreateParty from "./pages/admin/CreateParty";
import CreateCandidate from "./pages/admin/CreateCandidate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-election" element={<CreateElection />} />
        <Route path="/admin/create-party" element={<CreateParty />} />
        <Route path="/admin/create-candidate" element={<CreateCandidate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;