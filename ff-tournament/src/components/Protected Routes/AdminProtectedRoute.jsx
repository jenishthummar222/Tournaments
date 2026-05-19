import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {

  const user = JSON.parse(

    localStorage.getItem("user")

  );

  // NOT LOGGED IN
  if (!user) {

    return <Navigate to="/login" />;

  }

  // NOT ADMIN
  if (!user.is_admin) {

    return <Navigate to="/" />;

  }

  return children;

};

export default AdminProtected;