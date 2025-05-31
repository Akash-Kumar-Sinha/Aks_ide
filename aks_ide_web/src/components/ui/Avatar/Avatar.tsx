import React, { useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";
import { Mic, User } from "lucide-react";

type AvatarProps = HTMLMotionProps<"div"> & {
  image?: string;
  alt?: string;
  fallback?: string; // Text fallback (e.g., initials or email)
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  isHost?: boolean;
  isSpeaking?: boolean;
  className?: string;
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      image,
      alt = "Avatar image",
      fallback,
      variant = "default",
      scale = "lg",
      isHost = false,
      isSpeaking = false,
      className,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Determine what to show
    const showImage = image && !imageError && imageLoaded;
    const showFallback = !showImage;

    // Generate initials from fallback text (email or name)
    const getInitials = () => {
      if (!fallback) return "U";

      // If it's an email, extract the part before @
      if (fallback.includes("@")) {
        const emailPrefix = fallback.split("@")[0];
        // Try to get initials from email prefix (handle dots, underscores, etc.)
        const parts = emailPrefix.split(/[._-]/);
        if (parts.length > 1) {
          return parts
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
        }
        return emailPrefix.slice(0, 2).toUpperCase();
      }

      // If it's a name, get initials
      return fallback
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Get avatar size configuration
    const getSizeConfig = () => {
      switch (scale) {
        case "sm":
          return {
            containerSize: "w-8 h-8",
            fontSize: "text-xs",
            iconSize: 14,
            borderWidth: "1px",
          };
        case "lg":
          return {
            containerSize: "w-12 h-12",
            fontSize: "text-sm",
            iconSize: 18,
            borderWidth: "2px",
          };
        case "xl":
          return {
            containerSize: "w-16 h-16",
            fontSize: "text-base",
            iconSize: 24,
            borderWidth: "2px",
          };
        default:
          return {
            containerSize: "w-10 h-10",
            fontSize: "text-sm",
            iconSize: 16,
            borderWidth: "1px",
          };
      }
    };

    const sizeConfig = getSizeConfig();

    // Get status color
    const getStatusColor = () => {
      if (isSpeaking) return theme.accentColor || "#10b981";
      if (isHost) return theme.primaryColor || "#3b82f6";
      return theme.secondaryColor || "#6b7280";
    };

    const statusColor = getStatusColor();

    // Base avatar styles
    const baseStyles = {
      backgroundColor: showFallback ? statusColor : "transparent",
      borderColor: statusColor,
      borderWidth: sizeConfig.borderWidth,
      color: showFallback ? theme.backgroundColor || "#ffffff" : "inherit",
    };

    // Render minimal variant (simpler, more reliable)
    if (variant === "minimal") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full border overflow-hidden",
            sizeConfig.containerSize,
            className
          )}
          style={baseStyles}
          {...props}
        >
          {showImage ? (
            <img
              src={image}
              alt={alt}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : fallback ? (
            <span
              className={cn("font-medium select-none", sizeConfig.fontSize)}
            >
              {getInitials()}
            </span>
          ) : (
            <User size={sizeConfig.iconSize} />
          )}

          {/* Simple speaking indicator */}
          {isSpeaking && (
            <div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: theme.accentColor || "#10b981",
                borderColor: theme.backgroundColor || "#ffffff",
              }}
            />
          )}
        </div>
      );
    }

    // Default variant with motion
    return (
      <motion.div
        ref={ref}
        className={cn("relative inline-flex", className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...props}
      >
        {/* Glow effect for speaking/host */}
        {(isSpeaking || isHost) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${statusColor}30, transparent 70%)`,
              transform: "scale(1.5)",
            }}
            animate={
              isSpeaking
                ? {
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1.3, 1.7, 1.3],
                  }
                : {}
            }
            transition={
              isSpeaking
                ? {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }
                : {}
            }
          />
        )}

        <motion.div
          className={cn(
            "relative inline-flex items-center justify-center rounded-full border overflow-hidden",
            sizeConfig.containerSize
          )}
          style={{
            ...baseStyles,
            boxShadow: isSpeaking
              ? `0 0 8px ${statusColor}40`
              : isHost
              ? `0 0 4px ${statusColor}30`
              : "none",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showImage ? (
            <img
              src={image}
              alt={alt}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : fallback ? (
            <span
              className={cn("font-medium select-none", sizeConfig.fontSize)}
            >
              {getInitials()}
            </span>
          ) : (
            <User size={sizeConfig.iconSize} />
          )}

          {/* Speaking indicator with mic icon */}
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -bottom-1 -right-1 p-1 rounded-full"
              style={{
                backgroundColor: theme.accentColor || "#10b981",
                border: `2px solid ${theme.backgroundColor || "#ffffff"}`,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Mic
                  size={scale === "sm" ? 8 : scale === "lg" ? 10 : 12}
                  color="white"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Host indicator */}
          {isHost && !isSpeaking && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: theme.primaryColor || "#3b82f6",
                borderColor: theme.backgroundColor || "#ffffff",
                color: theme.backgroundColor || "#ffffff",
              }}
            >
              H
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
