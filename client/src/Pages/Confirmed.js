import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Front-end confirmation page: call backend /confirm/verify/:token then redirect home
const Confirmed = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await axios.get(`/confirm/verify/${token}`);
        navigate("/");
      } catch (err) {
        console.log("Email confirmation failed", err);
      }
    };
    confirmEmail();
  }, [navigate, token]);

  return <div>You are confirmed {token}</div>;
};

export default Confirmed;
