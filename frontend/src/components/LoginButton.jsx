import React from "react";

const LoginButton = ({ text = "Login", bgColor = "blue", loading = false, ...props }) => {
  const bgClass = `bg-${bgColor}-600 hover:bg-${bgColor}-700`;
  return (
    <button
      {...props}
      className={`${bgClass} w-full text-white py-3 rounded-lg transition font-semibold flex items-center justify-center ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={loading}
    >
      {loading ? "Loading..." : text}
    </button>
  );
};

export default LoginButton;
