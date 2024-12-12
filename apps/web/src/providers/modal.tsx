import { createContext, useContext, useState } from "react";

type ModalContextType = {
  isOpen: boolean;
  openModal: (
    contentType: string,
    entityId?: string,
    entityLabel?: string,
  ) => void;
  closeModal: () => void;
  modalContentType: string;
  entityId: string;
  entityLabel: string;
};

interface Props {
  children: React.ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [entityId, setEntityId] = useState("");
  const [entityLabel, setEntityLabel] = useState("");
  const [modalContentType, setModalContentType] = useState("");

  const openModal = (
    contentType: string,
    entityId?: string,
    entityLabel?: string,
  ) => {
    setIsOpen(true);
    setModalContentType(contentType);
    if (entityId) setEntityId(entityId);
    if (entityLabel) setEntityLabel(entityLabel);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        modalContentType,
        entityId,
        entityLabel,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
