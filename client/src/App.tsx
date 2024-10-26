import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Persons from "./pages/Persons";
import AddPerson from "./pages/AddPerson";
import AddSection from "./pages/Section";
import AddLocation from "./pages/Location";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white p-4 shadow-md">
          <div className="flex justify-center space-x-4">
            <Link to="/">Personët</Link>
            <Link to="/add-person">Shto një person</Link>
            <Link to="/add-location">Lokacionët</Link>
            <Link to="/add-section">Seksionët</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Persons />} />
          <Route path="/add-person" element={<AddPerson />} />
          <Route path="/add-location" element={<AddLocation />} />
          <Route path="/add-section" element={<AddSection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
