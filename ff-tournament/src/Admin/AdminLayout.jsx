import {

  ShieldCheck,
  X,
  Menu

} from "lucide-react";

import {

  Outlet,
  useNavigate,
  useLocation

} from "react-router-dom";

import { useState } from "react";

const AdminLayout = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menu = [

    {
      name: "Dashboard",
      path: "/admin"
    },

    {
      name: "Create Tournament",
      path: "/admin/create-tournament"
    },

    {
      name: "Manage Tournament",
      path: "/admin/manage"
    },

    {
      name: "Add Cash Requests",
      path: "/admin/add-cash"
    },

    {
      name: "Withdraw Requests",
      path: "/admin/withdraw"
    },

    {
      name: "Transactions",
      path: "/admin/transactions"
    },

    {
      name: "Users",
      path: "/admin/users"
    },

    {
      name: "UserDashboard",
      path:"/"
    }

  ];

  return (

    <div className="min-h-screen bg-black text-white flex relative scrollbar-hide">
      {/* MOBILE TOPBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 sm:hidden flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-xl border-b border-yellow-500/10 scrollbar-hide">

        <div className="flex items-center gap-3 scrollbar-hide">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <ShieldCheck className="text-black w-5 h-5" />
          </div>

          <div>
            <h1 className="text-lg font-black text-yellow-400">
              ADMIN PANEL
            </h1>
          </div>

        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-yellow-400"
        >
          {
            sidebarOpen
            ? <></>
            : <Menu className="w-7 h-7" />
          }
        </button>

      </div>

      {/* SIDEBAR */}
      <div
        className={`
        fixed sm:relative top-0 left-0 z-50 h-screen
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full sm:translate-x-0"
        }
        ${
          sidebarOpen
            ? "w-72"
            : "sm:w-24"
        }
        transition-all duration-300
        border-r border-yellow-500/10
        bg-black/95 sm:bg-white/5
        backdrop-blur-xl
        p-6
        overflow-y-auto
        `}
      >
        
        {/* TOP */}
        <div className="flex items-center justify-between mb-10">

          {sidebarOpen && (

            <div className="flex items-center gap-3">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">

                <ShieldCheck className="text-black w-7 h-7" />

              </div>

              <div>

                <h1 className="text-3xl font-black text-yellow-400">

                  ADMIN

                </h1>

                <p className="text-gray-500 text-sm">

                  FF ARENA PANEL

                </p>

              </div>

            </div>

          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-yellow-400"
          >

            {
              sidebarOpen
                ? <X />
                : <Menu />
            }

          </button>

        </div>

        {/* MENU */}
        <div className="space-y-4">

          {menu.map((item, index) => (

            <button

              key={index}

              onClick={() => {

                navigate(item.path);

                if (window.innerWidth < 640) {
                  setSidebarOpen(false);
                }

              }}

              className={`
              w-full
              text-left
              px-5 py-4
              rounded-2xl
              transition-all duration-300
              font-bold
              ${
                location.pathname === item.path
                ? "bg-yellow-500 text-black"
                : "bg-black/30 border border-yellow-500/10 hover:border-yellow-400/30 hover:bg-yellow-500/10"
              }
              `}
            >

              {
                sidebarOpen
                ? item.name
                : item.name[0]
              }

            </button>

          ))}

        </div>

      </div>

      {/* MOBILE OVERLAY */}
        {
          sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 sm:hidden"
            />
          )
        }

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto sm:ml-0 mt-20 sm:mt-0">

        <Outlet />

      </div>

    </div>

  );

};

export default AdminLayout;