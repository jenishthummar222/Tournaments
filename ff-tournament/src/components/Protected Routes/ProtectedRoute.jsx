import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const token =
    localStorage.getItem("token");
  
  const lastActivity =
    localStorage.getItem("lastActivity");
  
  // 1 hour
  const SESSION_TIME =
    60 * 60 * 1000;         // 60 min  * 60 sec * 1000 millisecond

  if (!token || !lastActivity) {

    return <Navigate to="/login" replace />;
  }

  // Check expiry
  const currentTime = Date.now();
  const difference =
    currentTime - lastActivity;

  if (difference > SESSION_TIME) {

    // Logout automatically
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("lastActivity");

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;