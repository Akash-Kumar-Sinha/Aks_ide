"use client"

import { useRouter } from "next/navigation"
import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useUserProfile from "@/utils/useUserProfile"

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { userProfile } = useUserProfile()

  const initials = userProfile?.name
    ? userProfile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : userProfile?.email?.slice(0, 2).toUpperCase() ?? "U"

  const displayName = userProfile?.name || userProfile?.email || "Guest"
  const displayEmail = userProfile?.email ?? ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userProfile?.avatar} alt={displayName} />
                <AvatarFallback
                  className="rounded-lg text-[10px] font-semibold"
                  style={{ background: "var(--ide-elevated)", color: "#a1a1aa" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userProfile?.avatar} alt={displayName} />
                  <AvatarFallback
                    className="rounded-lg text-[10px] font-semibold"
                    style={{ background: "var(--ide-elevated)", color: "#a1a1aa" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(userProfile ? "/profile" : "/auth")}>
                <BadgeCheck />
                {userProfile ? "Profile" : "Sign in"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {userProfile && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => router.push("/auth?signout=true")}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavUser
