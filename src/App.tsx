
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import DealGenius from "@/pages/DealGenius";
import Subscription from "@/pages/Subscription";
import { Toaster } from "@/components/ui/toaster";

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (location.pathname === '/') return null;

  return (
    <nav className="bg-white border-b" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10">
          <ol className="flex items-center space-x-4 text-sm">
            <li>
              <div>
                <a href="/" className="text-gray-400 hover:text-gray-500">
                  Home
                </a>
              </div>
            </li>
            {paths.map((path, index) => (
              <li key={path}>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span 
                    className={`ml-4 ${
                      index === paths.length - 1 
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {path.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Breadcrumbs />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/deal-genius" element={<DealGenius />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
