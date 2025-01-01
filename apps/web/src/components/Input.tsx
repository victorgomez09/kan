import React, { forwardRef } from "react";
import ContentEditable from "react-contenteditable";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  contentEditable?: boolean;
  prefix?: string;
  value?: string;
  errorMessage?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { contentEditable, errorMessage, prefix, value, onChange, ...props },
    ref,
  ) => {
    if (contentEditable) {
      return (
        <ContentEditable
          placeholder={props.placeholder}
          html={value ?? ""}
          onChange={onChange}
          className="block min-h-[70px] w-full cursor-text rounded-md border-0 bg-dark-300 bg-white/5 px-3 py-1.5 text-light-900 shadow-sm ring-1 ring-inset ring-light-600 focus:ring-2 focus:ring-inset focus:ring-light-600 focus-visible:outline-none dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
        />
      );
    }

    return (
      <div className="flex w-full flex-col gap-1">
        <div className="flex">
          {prefix && (
            <div className="flex shrink-0 items-center rounded-l-md border border-r-0 border-light-600 px-3 text-base dark:border-dark-700 sm:text-sm/6">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            onChange={onChange}
            className={twMerge(
              "block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset ring-light-600 placeholder:text-dark-800 focus:ring-2 focus:ring-inset focus:ring-light-700 dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6",
              prefix && "rounded-l-none",
            )}
            {...props}
          />
        </div>
        {errorMessage && (
          <div className="text-xs text-red-500">{errorMessage}</div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
