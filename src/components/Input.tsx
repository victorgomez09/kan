import React, { forwardRef } from "react";

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ ...props }, ref) => {
  return (
    <input
      ref={ref}
      className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset ring-light-600 placeholder:text-dark-800 focus:ring-2 focus:ring-inset focus:ring-light-700 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
