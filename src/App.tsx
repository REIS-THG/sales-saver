
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import DealGenius from "@/pages/DealGenius";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/deal-genius" element={<DealGenius />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
