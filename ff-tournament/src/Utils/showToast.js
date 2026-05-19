import toast from "react-hot-toast";

// Success Toast
export const successToast = (message, options = {}) => {

    toast.success(message, {
        duration: options.duration || 5000,
        style: {
            background: "#111",
            color: "#FFD700",
            border: "1px solid #FFD700",
            padding: "14px",
            borderRadius: "14px",
            fontWeight: "600",
        },
        ...options
    });

};

// Error Toast
export const errorToast = (message, options = {}) => {


    toast.error(message, {
        duration: options.duration || 5000,
        style: {
            background: "#111",
            color: "#ff4d4d",
            border: "1px solid #ff4d4d",
            padding: "14px",
            borderRadius: "14px",
            fontWeight: "600",
        },
        ...options
    });

};

// Normal Toast
export const normalToast = (message, options = {}) => {

    toast(message, {
        duration: 5000,
        style: {
            background: "#111",
            color: "#fff",
            border: "1px solid #444",
            padding: "14px",
            borderRadius: "14px",
        },
        ...options
    });

};