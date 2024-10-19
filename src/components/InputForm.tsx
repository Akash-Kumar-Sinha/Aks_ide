import React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "./ui/input";

interface InputProps {
  id: string;
  type: string;
  placeholder: string;
  register: UseFormRegister<{ [key: string]: string | number | boolean }>;
  required?: boolean;
  errors: FieldErrors;
  disabled?: boolean;
}

const InputForm: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  register,
  required,
  errors,
  disabled,
}) => {
  return (
    <div className="w-full">
      {errors[id] && typeof errors[id]?.message === "string" && (
        <span className="flex justify-center text-red-500 text-xs font-medium mb-3">{errors[id]?.message}</span>
      )}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, { required })}
        className={`w-full px-4 py-3 bg-white border font-semibold text-gray-800 ${
          errors[id] ? "border-red-500" : "border-gray-300"
        } rounded-xl shadow-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-md disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={disabled}
      />
      
    </div>
  );
};

export default InputForm;
