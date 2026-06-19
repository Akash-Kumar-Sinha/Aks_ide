"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { TextureBg } from "@/components/ui/texture-bg";
import { SlideButton } from "@/components/ui/slide-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import useUserProfile from "@/utils/useUserProfile";
import socket from "@/utils/Socket";

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

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      socket.disconnect();
      router.push("/auth");
    }
  };

  return (
    <TextureBg
      className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
      blendMode="screen"
      opacity={0.15}
    >
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-140"
        >
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
                  <motion.button
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    onClick={() => router.push("/workspace")}
                    className="flex items-center gap-1.5 text-white/45 hover:text-white/75 transition-colors text-[11px] tracking-[0.14em] uppercase mb-8"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </motion.button>

                  {/* Two-column body */}
                  <div className="flex flex-col sm:flex-row sm:gap-0">
                    {/* ── Left: identity ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.45 }}
                      className="flex flex-col items-center text-center gap-4 pb-6 sm:pb-0 sm:pr-8 sm:w-48 shrink-0"
                    >
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
                    </motion.div>

                    {/* Divider */}
                    <div className="h-px sm:h-auto sm:w-px bg-white/[0.06] mb-6 sm:mb-0" />

                    {/* ── Right: fields + action ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28, duration: 0.45 }}
                      className="flex-1 flex flex-col justify-between sm:pl-8"
                    >
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
                    </motion.div>
                  </div>
                </div>

                <div className="h-px w-full bg-linear-to-r from-transparent via-white/[0.03] to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </TextureBg>
  );
}
