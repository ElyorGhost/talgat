import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
//Pages
import Dashboard from "./components/pages/dashboard";
import Login from "./components/pages/login";
import Signup from "./components/pages/signup";
import Profile from "./components/pages/profile";
import Explore from "./components/pages/explore";
import { AuthContext } from "./components/context/AuthContext";

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <ChakraProvider>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/:username" element={<Profile />} />
        </Routes>
      </ChakraProvider>
    </Router>
  );
}

export default App;
