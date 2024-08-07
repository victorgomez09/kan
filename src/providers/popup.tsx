import { createContext, useContext, useState } from "react";

type PopupContextType = {
  isOpen: boolean;
  showPopup: (params: { header: string; message: string }) => void;
  hidePopup: () => void;
  popupHeader: string;
  popupMessage: string;
};

interface Props {
  children: React.ReactNode;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupHeader, setPopupHeader] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const showPopup = ({
    header,
    message,
  }: {
    header: string;
    message: string;
  }) => {
    setIsOpen(true);
    setPopupHeader(header);
    setPopupMessage(message);
  };

  const hidePopup = () => {
    setIsOpen(false);
  };

  return (
    <PopupContext.Provider
      value={{ isOpen, showPopup, hidePopup, popupHeader, popupMessage }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};
