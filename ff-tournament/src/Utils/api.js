export const apiFetch = async(url, options = {}) => {

    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    });

    // 🚨 GLOBAL AUTH HANDLING
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return null;
    }

    return response;
};