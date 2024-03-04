"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api } from "~/trpc/react";

interface WorkspaceContextProps {
  workspace: Workspace;
  setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>;
}

interface Workspace {
  name: string;
  publicId: string;
}

const initialBoardData: Workspace = {
  name: "",
  publicId: "",
};

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(
  undefined,
);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [workspace, setWorkspace] = useState<Workspace>(initialBoardData);

  const { data } = api.workspace.all.useQuery();

  useEffect(() => {
    const storedWorkspaceId: string | null =
      localStorage.getItem("workspacePublicId");

    if (storedWorkspaceId !== null) {
      const selectedWorkspace = data?.find(
        ({ workspace }) => (workspace.publicId = storedWorkspaceId),
      );

      if (!selectedWorkspace) return;

      setWorkspace({
        publicId: selectedWorkspace.workspace.publicId,
        name: selectedWorkspace.workspace.name,
      });
    } else {
      const primaryWorkspace = data?.[0]?.workspace;

      if (!primaryWorkspace) return;

      localStorage.setItem("workspacePublicId", primaryWorkspace?.publicId);

      setWorkspace({
        publicId: primaryWorkspace?.publicId,
        name: primaryWorkspace?.name,
      });
    }
  }, [data]);

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextProps => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
