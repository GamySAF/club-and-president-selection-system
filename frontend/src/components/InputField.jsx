import React from "react";

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  focusColor = "blue",
}) => {
  const focusRingClass = `focus:ring-2 focus:ring-${focusColor}-400`;

  return (
    <div className="mb-5 w-full">
      <div className="flex flex-col md:flex-row md:items-center">
        <label className="w-full text-left text-gray-700 font-medium mb-1 md:mb-0 md:w-1/3 md:pr-4">
          {label}
        </label>

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full md:w-2/3 px-4 py-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none ${focusRingClass} transition`}
        />
      </div>
    </div>
  );
};

export default InputField;
