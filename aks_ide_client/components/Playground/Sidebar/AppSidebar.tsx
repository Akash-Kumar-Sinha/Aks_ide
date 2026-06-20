"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FoldersIcon, Maximize2, Minimize2 } from "lucide-react";
import { TiDocumentText } from "react-icons/ti";
import { Logo } from "@/components/Logo/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";
import Explorer from "./SidbarStructure/Explorer";
import Document from "./SidbarStructure/Document";
import type { TreeNode } from "@/components/Playground/hooks/useFileNavigation";

interface AppSidebarProps {
  treeMap: Map<string, TreeNode[]>;
  fetchingPaths: Set<string>;
  explorerLoadingStatus?: boolean;
  fetchPath: (path: string) => void;
  onRefresh?: () => void;
  selectedAbsolutePath?: string;
  onFileSelect?: (name: string, absolutePath: string) => void;
  toggleFullScreen: () => void;
  isFullScreen: boolean;
}

type ActiveView = "explorer" | "document" | null;

const NAV_ITEMS = [
  { id: "explorer" as const, label: "Explorer", Icon: FoldersIcon },
  { id: "document" as const, label: "Document", Icon: TiDocumentText },
];

function AppSidebarInner({
  treeMap,
  fetchingPaths,
  explorerLoadingStatus,
  fetchPath,
  onRefresh,
  selectedAbsolutePath,
  onFileSelect,
  toggleFullScreen,
  isFullScreen,
}: AppSidebarProps) {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [activeView, setActiveView] = useState<ActiveView>("explorer");

  const toggle = (id: ActiveView) => {
    if (activeView === id) {
      setActiveView(null);
      setOpen(false);
    } else {
      setActiveView(id);
      setOpen(true);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      {/* Icon rail */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
        style={{
          background: "var(--ide-panel)",
          borderColor: "var(--ide-border)",
        }}
      >
        <SidebarHeader className="border-b pb-3" style={{ borderColor: "var(--ide-border)" }}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="md:h-9 md:p-0 hover:bg-white/5"
              >
                <button onClick={() => router.push("/")}>
                  <div className="flex aspect-square size-9 items-center justify-center rounded-lg">
                    <Logo className="size-5 text-blue-500" />
                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      tooltip={{ children: label, hidden: false }}
                      onClick={() => toggle(id)}
                      isActive={activeView === id}
                      className="px-2.5 md:px-2 rounded-lg"
                      style={
                        activeView === id
                          ? {
                              color: "var(--ide-icon-active)",
                              background: "var(--ide-elevated)",
                            }
                          : { color: "var(--ide-icon)" }
                      }
                    >
                      <Icon className="size-[18px]" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t pt-3 gap-2" style={{ borderColor: "var(--ide-border)" }}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{ children: isFullScreen ? "Exit Fullscreen" : "Fullscreen", hidden: false }}
                onClick={toggleFullScreen}
                className="px-2.5 md:px-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              >
                {isFullScreen
                  ? <Minimize2 className="size-4" />
                  : <Maximize2 className="size-4" />
                }
                <span>{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Content panel */}
      <Sidebar
        collapsible="none"
        className="hidden flex-1 md:flex"
        style={{
          background: "var(--ide-surface)",
          borderColor: "var(--ide-border)",
        }}
      >
        <SidebarContent className="overflow-hidden">
          {activeView === "explorer" ? (
            <Explorer
              treeMap={treeMap}
              fetchingPaths={fetchingPaths}
              explorerLoadingStatus={explorerLoadingStatus ?? false}
              fetchPath={fetchPath}
              onRefresh={onRefresh}
              selectedAbsolutePath={selectedAbsolutePath}
              onFileSelect={onFileSelect}
            />
          ) : activeView === "document" ? (
            <Document />
          ) : null}
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  return <AppSidebarInner {...props} />;
}

export default AppSidebar;
