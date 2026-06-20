"use client";

import type { CSSProperties } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Playground/Sidebar/AppSidebar";
import EditorArea from "@/components/Playground/EditorArea";
import { useSocketConnection } from "@/components/Playground/hooks/useSocketConnection";
import { useFileNavigation } from "@/components/Playground/hooks/useFileNavigation";
import { useOpenFiles } from "@/components/Playground/hooks/useOpenFiles";
import { useFullScreen } from "@/components/Playground/hooks/useFullScreen";
import { useTerminalPanel } from "@/components/Playground/hooks/useTerminalPanel";
import { getLanguage } from "@/components/Playground/types";
import useUserProfile from "@/utils/useUserProfile";

export default function WorkspacePage() {
  const { userProfile } = useUserProfile();

  const { connected, repoLoadedRef, terminalReadyRef } = useSocketConnection();
  const { treeMap, fetchingPaths, explorerLoadingStatus, openRepo, fetchPath } =
    useFileNavigation({ email: userProfile?.email, repoLoadedRef, terminalReadyRef });
  const { openFiles, activeFileIdx, activeFile, openFile, closeFile, setActiveFileIdx, saveStatus, onSaveStatusChange } =
    useOpenFiles();
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const { terminalOpen, toggle: toggleTerminal } = useTerminalPanel();

  const language = activeFile ? getLanguage(activeFile.name) : "";

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{
        "--sidebar-width": "312px",
        "--sidebar-width-icon": "56px",
      } as CSSProperties}
      className="flex h-screen w-full overflow-hidden"
    >
      <AppSidebar
        treeMap={treeMap}
        fetchingPaths={fetchingPaths}
        explorerLoadingStatus={explorerLoadingStatus}
        fetchPath={fetchPath}
        onRefresh={openRepo}
        selectedAbsolutePath={activeFile?.absolutePath}
        onFileSelect={openFile}
        toggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
      />
      <EditorArea
        openFiles={openFiles}
        activeFileIdx={activeFileIdx}
        activeFile={activeFile}
        onTabClick={setActiveFileIdx}
        onTabClose={closeFile}
        onSaveStatusChange={onSaveStatusChange}
        saveStatus={saveStatus}
        terminalOpen={terminalOpen}
        onToggleTerminal={toggleTerminal}
        connected={connected}
        language={language}
      />
    </SidebarProvider>
  );
}
