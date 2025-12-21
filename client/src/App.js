import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import LandingPage from "./Pages/LandingPage";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import PetDash from "./Pages/PetDash";
import HealthAnalytics from "./Pages/HealthAnalytics";
import NavBar from "./Components/NavBar";
import { ToastContainer } from "react-toastify";
import Footer from "./Components/Footer";
import PetContext from "./Context/PetContext";
import UserContext from "./Context/UserContext";
import Confirmed from "./Pages/Confirmed";
import Confirm from "./Pages/Confirm";
import NearbyServices from "./Pages/NearbyServices";
import PetExpenses from "./Pages/PetExpenses";
import { ThemeProvider } from "./Context/ThemeContext";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Community from "./Pages/Community";
import Profile from "./Pages/Profile";
import Chat from "./Pages/Chat";



function App() {
  const [userData, setUserData] = useState({ user: undefined, token: undefined });
  const [newPetData, setNewPetData] = useState("pet babies");
  const [petId, setPetId] = useState("");
  const [appt, setAppt] = useState(0);
  const [pets, setPets] = useState([]);

  const [loading, setLoading] = useState(true);

  const checkLoggedIn = async () => {
    let token = localStorage.getItem("auth-token");
    if (token === null) {
      localStorage.setItem("auth-token", "");
      token = "";
    }
    try {
      if (token) {
        const userRes = await axios.get("/users", { headers: { "x-auth-token": token } });
        setUserData({ token, user: userRes.data });
      }
    } catch (err) {
      console.log("User must login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  if (loading) return null; // or a loading spinner

  return (
    <div className="App">
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ToastContainer />
          <UserContext.Provider value={{ userData, setUserData }}>
            <PetContext.Provider value={{ newPetData, setNewPetData, petId, setPetId, appt, setAppt, pets, setPets }}>
              <NavBar />
              <Routes>
                <Route path="/pet/:id" element={<PetDash />} />
                <Route path="/pet/expenses/:id" element={<PetExpenses />} />
                <Route path="/nearby" element={<NearbyServices />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/analytics" element={<HealthAnalytics />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/confirm" element={<Confirm />} />
                <Route path="/confirm_token/:token" element={<Confirmed />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<LandingPage />} />
              </Routes>
              <Footer />
            </PetContext.Provider>
          </UserContext.Provider>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
