import React, { forwardRef } from "react";
import ContentEditable from "react-contenteditable";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  contentEditable?: boolean;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ contentEditable, value, onChange, ...props }, ref) => {
    if (contentEditable) {
      return (
        <ContentEditable
          placeholder={props.placeholder}
          html={value || ""}
          onChange={onChange}
          className="block min-h-[70px] w-full cursor-text rounded-md border-0 bg-dark-300 bg-white/5 px-3 py-1.5 text-light-900 text-neutral-900 shadow-sm ring-1 ring-inset ring-light-600 focus:ring-2 focus:ring-inset focus:ring-light-600 focus-visible:outline-none dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
        />
      );
    }

    return (
      <input
        ref={ref}
        className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset ring-light-600 placeholder:text-dark-800 focus:ring-2 focus:ring-inset focus:ring-light-700 dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
