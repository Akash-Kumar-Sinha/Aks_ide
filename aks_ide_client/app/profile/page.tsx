"use client";

import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";
import { TextureBg } from "@/components/ui/texture-bg";
import { SlideButton } from "@/components/ui/slide-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import useUserProfile from "@/utils/useUserProfile";
import { useLogout } from "@/utils/useLogout";

gsap.registerPlugin(useGSAP);

function ProfileField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-[10px] uppercase tracking-[0.16em] text-white/50 shrink-0">
        {label}
      </span>
      <span
        className={`text-right max-w-[58%] break-all leading-snug text-white/85 ${
          mono ? "font-mono text-[11px]" : "text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { userProfile, loading } = useUserProfile();
  const handleLogout = useLogout();

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power2.out" } })
      .from(".gsap-profile-card",   { opacity: 0, y: 24, duration: 0.6 })
      .from(".gsap-profile-back",   { opacity: 0, x: -6, duration: 0.35 }, "-=0.45")
      .from(".gsap-profile-avatar", { opacity: 0, y: 8,  duration: 0.45 }, "-=0.3")
      .from(".gsap-profile-fields", { opacity: 0, y: 8,  duration: 0.45 }, "-=0.3");
  });

  return (
    <TextureBg
      className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
      blendMode="screen"
      opacity={0.15}
    >
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="gsap-profile-card w-full max-w-140">
          <div className="relative">
            <div
              className="relative rounded-2xl p-px"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)",
              }}
            >
              <div
                className="w-full rounded-[15px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(160deg, #131318 0%, #0c0c10 55%, #080809 100%)",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)",
                }}
              >
                <div className="p-8">
                  <button
                    className="gsap-profile-back flex items-center gap-1.5 text-white/45 hover:text-white/75 transition-colors text-[11px] tracking-[0.14em] uppercase mb-8"
                    onClick={() => router.push("/workspace")}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </button>

                  <div className="flex flex-col sm:flex-row sm:gap-0">
                    <div className="gsap-profile-avatar flex flex-col items-center text-center gap-4 pb-6 sm:pb-0 sm:pr-8 sm:w-48 shrink-0">
                      {loading ? (
                        <Skeleton className="w-24 h-24 rounded-full" />
                      ) : (
                        <div className="relative">
                          <div
                            className="relative rounded-full p-[3px]"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
                            }}
                          >
                            <UserAvatar
                              src={userProfile?.avatar}
                              name={
                                userProfile?.name ||
                                userProfile?.email ||
                                "User"
                              }
                              size="xl"
                              className="w-24 h-24"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {loading ? (
                          <>
                            <Skeleton className="w-32 h-5 mx-auto" />
                            <Skeleton className="w-40 h-3 mx-auto" />
                          </>
                        ) : (
                          <>
                            <h2 className="text-lg font-semibold text-white tracking-tight leading-tight">
                              {userProfile?.name || "No name"}
                            </h2>
                            <p className="text-[11px] text-white/55 font-mono leading-relaxed break-all">
                              {userProfile?.email || ""}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="h-px sm:h-auto sm:w-px bg-white/[0.06] mb-6 sm:mb-0" />
                    <div className="gsap-profile-fields flex-1 flex flex-col justify-between sm:pl-8">
                      {loading ? (
                        <div className="space-y-4 py-1">
                          {[36, 44, 52, 60].map((w) => (
                            <div
                              key={w}
                              className="flex justify-between items-center py-1"
                            >
                              <Skeleton className="w-14 h-3" />
                              <Skeleton
                                className="h-3"
                                style={{ width: `${w * 2}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        userProfile && (
                          <div>
                            {userProfile.username && (
                              <ProfileField
                                label="Username"
                                value={userProfile.username}
                                mono
                              />
                            )}
                            {userProfile.first_name && (
                              <ProfileField
                                label="First name"
                                value={userProfile.first_name}
                              />
                            )}
                            {userProfile.last_name && (
                              <ProfileField
                                label="Last name"
                                value={userProfile.last_name}
                              />
                            )}
                            <ProfileField
                              label="Email"
                              value={userProfile.email}
                              mono
                            />
                          </div>
                        )
                      )}

                      <div className="mt-6">
                        <SlideButton
                          design="obsidian"
                          className="w-full justify-center px-6 py-3 text-[11px]"
                          onClick={handleLogout}
                        >
                          Sign Out
                        </SlideButton>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-linear-to-r from-transparent via-white/[0.03] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TextureBg>
  );
}
