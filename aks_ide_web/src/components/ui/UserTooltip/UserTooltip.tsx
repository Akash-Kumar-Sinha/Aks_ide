import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import { Mic } from "lucide-react";
import { Avatar } from "../Avatar/Avatar";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type UserTooltipProps = HTMLMotionProps<"div"> & {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
  activeSpeakerIds?: number[];
  hostId?: number;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  className?: string;
};

const UserTooltip = React.forwardRef<HTMLDivElement, UserTooltipProps>(
  (
    {
      items,
      activeSpeakerIds = [3],
      hostId =2,
      variant = "default",
      scale = "lg",
      className,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const springConfig = { stiffness: 100, damping: 5 };
    const x = useMotionValue(0);
    const rotate = useSpring(
      useTransform(x, [-100, 100], [-25, 25]),
      springConfig
    );
    const translateX = useSpring(
      useTransform(x, [-100, 100], [-50, 50]),
      springConfig
    );

    const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
      const halfWidth = event.currentTarget.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    };

    // Group users by their roles
    const activeSpeakers = items.filter((item) =>
      activeSpeakerIds.includes(item.id)
    );
    const host = items.find((item) => item.id === hostId);
    const isHostSpeaking = host && activeSpeakerIds.includes(host.id);
    const activeNonHostSpeakers = activeSpeakers.filter(
      (item) => item.id !== hostId
    );
    const otherParticipants = items.filter(
      (item) => !activeSpeakerIds.includes(item.id) && item.id !== hostId
    );

    // Get size configurations based on scale
    const getSizeConfig = () => {
      switch (scale) {
        case "sm":
          return {
            gap: "gap-3",
            containerPadding: "p-3",
            micSize: 10,
            tooltipPadding: "px-3 py-2",
            tooltipOffset: "-top-14",
            participantSpacing: "-space-x-1",
          };
        case "lg":
          return {
            gap: "gap-6",
            containerPadding: "p-4",
            micSize: 12,
            tooltipPadding: "px-4 py-3",
            tooltipOffset: "-top-18",
            participantSpacing: "-space-x-2",
          };
        case "xl":
          return {
            gap: "gap-8",
            containerPadding: "p-6",
            micSize: 14,
            tooltipPadding: "px-5 py-4",
            tooltipOffset: "-top-22",
            participantSpacing: "-space-x-3",
          };
        default:
          return {
            gap: "gap-6",
            containerPadding: "p-4",
            micSize: 12,
            tooltipPadding: "px-4 py-3",
            tooltipOffset: "-top-18",
            participantSpacing: "-space-x-2",
          };
      }
    };

    const sizeConfig = getSizeConfig();

    // Create tooltip content based on variant
    const createTooltip = (item: (typeof items)[0], isSpeaking: boolean) => {
      const baseTooltipProps = {
        key: `tooltip-${item.id}`,
        initial: { opacity: 0, y: 20, scale: 0.6 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 10,
          },
        },
        exit: { opacity: 0, y: 20, scale: 0.6 },
        style: {
          translateX: translateX,
          rotate: rotate,
          whiteSpace: "nowrap" as const,
        },
        className: `absolute ${sizeConfig.tooltipOffset} left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-xl ${sizeConfig.tooltipPadding} text-xs overflow-hidden`,
      };

      switch (variant) {
        case "default":
          return (
            <motion.div
              {...baseTooltipProps}
              style={{
                ...baseTooltipProps.style,
                backgroundColor: `${theme.backgroundColor}F0`,
                backdropFilter: "blur(8px)",
                color: theme.textColor,
                boxShadow: `0 8px 32px -4px ${theme.primaryShade}, 0 4px 8px ${theme.secondaryShade}`,
                borderColor: theme.secondaryShade,
                border: "1px solid",
              }}
            >
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                  background: theme.primaryGradient,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Animated underline */}
              <motion.div
                className="absolute -bottom-px z-30 h-0.5 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div
                className="relative z-30 text-base font-bold flex items-center gap-2"
                style={{ color: isSpeaking ? theme.accentColor : theme.primaryColor }}
              >
                {item.name}
                {isSpeaking && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Mic
                      size={sizeConfig.micSize}
                      style={{ color: theme.accentColor }}
                      className="inline-block"
                    />
                  </motion.div>
                )}
              </div>

              <div className="text-xs mt-1 relative z-30" style={{ color: theme.textDimmed }}>
                {item.designation}
              </div>
            </motion.div>
          );

        case "minimal":
          return (
            <motion.div
              {...baseTooltipProps}
              style={{
                ...baseTooltipProps.style,
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                boxShadow: `0 2px 8px ${theme.primaryShade}40`,
                borderColor: theme.textDimmed,
                border: "1px solid",
              }}
            >
              <div
                className="font-medium flex items-center gap-2"
                style={{ color: isSpeaking ? theme.accentColor : theme.textColor }}
              >
                {item.name}
                {isSpeaking && (
                  <Mic
                    size={sizeConfig.micSize}
                    style={{ color: theme.accentColor }}
                    className="inline-block"
                  />
                )}
              </div>
              <div className="text-xs mt-0.5" style={{ color: theme.textDimmed }}>
                {item.designation}
              </div>
            </motion.div>
          );

        default:
          return null;
      }
    };

    // Create participant with Avatar component and tooltip
    const createParticipant = (
      item: (typeof items)[0],
      isHost: boolean,
      isSpeaking: boolean,
      index: number
    ) => {
      // Determine scale for Avatar based on role and UserTooltip scale
      const getAvatarScale = (): SpaceVariantType => {
        if (isHost) {
          return scale === "sm" ? "lg" : scale === "lg" ? "xl" : "xl";
        }
        if (isSpeaking) {
          return scale;
        }
        return scale === "xl" ? "lg" : scale === "lg" ? "sm" : "sm";
      };

      return (
        <div
          className="relative group"
          key={`participant-${item.id}-${index}`}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && createTooltip(item, isSpeaking)}
          </AnimatePresence>

          <div onMouseMove={handleMouseMove}>
            <Avatar
              image={item.image}
              alt={item.name}
              variant={variant}
              scale={getAvatarScale()}
              isHost={isHost}
              isSpeaking={isSpeaking}
            />
          </div>
        </div>
      );
    };

    // Render based on design variant and scale
    switch (variant) {
      case "default":
      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                ref={ref}
                className={cn("flex flex-wrap items-center justify-center", sizeConfig.containerPadding, className)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                {...props}
              >
                <div className={cn("flex items-center", sizeConfig.gap)}>
                  {/* Host */}
                  {host && (
                    <div className="flex items-center justify-center">
                      {createParticipant(host, true, isHostSpeaking ?? false, 0)}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {/* Active Speakers */}
                    {activeNonHostSpeakers.length > 0 && (
                      <div className={cn("flex items-center gap-3")}>
                        {activeNonHostSpeakers.map((item, index) =>
                          createParticipant(item, false, true, index)
                        )}
                      </div>
                    )}

                    {/* Other Participants */}
                    {otherParticipants.length > 0 && (
                      <div className={cn("flex", sizeConfig.participantSpacing)}>
                        {otherParticipants.map((item, index) =>
                          createParticipant(item, false, false, index)
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                ref={ref}
                className={cn("flex flex-wrap items-center justify-center", sizeConfig.containerPadding, className)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                {...props}
              >
                <div className={cn("flex items-center", sizeConfig.gap)}>
                  {/* Host */}
                  {host && (
                    <div className="flex items-center justify-center">
                      {createParticipant(host, true, isHostSpeaking ?? false, 0)}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Active Speakers */}
                    {activeNonHostSpeakers.length > 0 && (
                      <div className={cn("flex items-center gap-4")}>
                        {activeNonHostSpeakers.map((item, index) =>
                          createParticipant(item, false, true, index)
                        )}
                      </div>
                    )}

                    {/* Other Participants */}
                    {otherParticipants.length > 0 && (
                      <div className={cn("flex", sizeConfig.participantSpacing)}>
                        {otherParticipants.map((item, index) =>
                          createParticipant(item, false, false, index)
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                ref={ref}
                className={cn("flex flex-wrap items-center justify-center", sizeConfig.containerPadding, className)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                {...props}
              >
                <div className={cn("flex items-center", sizeConfig.gap)}>
                  {/* Host */}
                  {host && (
                    <div className="flex items-center justify-center">
                      {createParticipant(host, true, isHostSpeaking ?? false, 0)}
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    {/* Active Speakers */}
                    {activeNonHostSpeakers.length > 0 && (
                      <div className={cn("flex items-center gap-6")}>
                        {activeNonHostSpeakers.map((item, index) =>
                          createParticipant(item, false, true, index)
                        )}
                      </div>
                    )}

                    {/* Other Participants */}
                    {otherParticipants.length > 0 && (
                      <div className={cn("flex", sizeConfig.participantSpacing)}>
                        {otherParticipants.map((item, index) =>
                          createParticipant(item, false, false, index)
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

UserTooltip.displayName = "UserTooltip";

export { UserTooltip };