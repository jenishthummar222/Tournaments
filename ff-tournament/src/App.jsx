import { useEffect, useState } from 'react'
import {
requestNotificationPermission
} from "./firebase";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "./App.css"
import "./index.css"
import Home from "./components/Home"
import Login from "./components/Login"
import Register from "./components/Register";
import Dashboard from "./components/User/Dashboard"

import AdminProtected from "./components/Protected Routes/AdminProtectedRoute";
import ProtectedRoute from "./components/Protected Routes/ProtectedRoute";
import PublicRoute from "./components/Protected Routes/PublicRoute";
import ForgotPassword from "./components/ForgotPassword";

/* Admin */
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/Pages/AdminDashboard";
import CreateTournament from "./Admin/Pages/CreateTournament";
import ManageTournament from "./Admin/Pages/ManageTournament";
import AddCashRequests from "./Admin/Pages/AddCashRequests"
import WithdrawRequests from "./Admin/Pages/WithdrawRequests";
import Transactions from "./Admin/Pages/Transactions";
import AdminUsers from "./Admin/Pages/AdminUsers";

const App = () => {

  useEffect(() => {

const setupFCM = async () => {

  const token = localStorage.getItem("token");

  if (!token) return;

  const fcmToken = await requestNotificationPermission();

  if (!fcmToken) return;

  await fetch(

    `${import.meta.env.VITE_API_URL}/save-fcm-token`,

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`

      },

      body: JSON.stringify({

        fcm_token: fcmToken

      })

    }

  );


  };

  setupFCM();

  }, []);


  useEffect(() => {

    const disableRightClick = (e) => {

      e.preventDefault();

    };

    document.addEventListener(
      "contextmenu",
      disableRightClick
    );

    return () => {

      document.removeEventListener(
        "contextmenu",
        disableRightClick
      );

    };

  }, []);
  
  useEffect(() => {

  const updateActivity = () => {

    localStorage.setItem(
      "lastActivity",
      Date.now()
    );

  };

  // Track user activity
  window.addEventListener(
    "click",
    updateActivity
  );

  window.addEventListener(
    "keydown",
    updateActivity
  );

  window.addEventListener(
    "mousemove",
    updateActivity
  );

  // Initial activity
  updateActivity();

  // Cleanup
  return () => {

    window.removeEventListener(
      "click",
      updateActivity
    );

    window.removeEventListener(
      "keydown",
      updateActivity
    );

    window.removeEventListener(
      "mousemove",
      updateActivity
    );

  };

}, []);

  return (
    
    <BrowserRouter>
      
      <Routes>

        {/* Public */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
            }        
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={            
            <ForgotPassword />              
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected */}

        
        <Route
           path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>  
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={

            <AdminProtected>

              <AdminLayout/>

            </AdminProtected>

          }
        >
          {/* Dashboard */}
          <Route

            index

            element={<AdminDashboard />}

          />

          {/* Create Tournament */}
          <Route

            path="create-tournament"

            element={<CreateTournament />}

          />
              
          {/* Manage All Tournament*/}
          <Route
            path="manage"
            element={<ManageTournament />}
          />        

          {/* add request  */}
          <Route
            path="add-cash"
            element={<AddCashRequests />}
          />
          

          {/* Withdraw request  */}
            <Route
              path="withdraw"
              element={<WithdrawRequests/>}
            />

          {/* Transaction history */}
          <Route

            path="transactions"

            element={<Transactions />}

          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

      </Route>

      </Routes>      
      
    </BrowserRouter>
  );
}

export default App 
