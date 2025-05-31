import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";
import useTheme, { type Theme } from "../lib/useTheme";
import { cn } from "../lib/utils";

type NotFoundProps = {
  onGoHome?: () => void;
  onGoBack?: () => void;
  customMessage?: string;
  className?: string;
  designVariant?: DesignVariantType;
  spaceVariant?: SpaceVariantType;
};

interface SpaceConfig {
  containerPadding: string;
  contentPadding: string;
  numberSize: string;
  headingSize: string;
  messageSize: string;
  iconSize: number;
  buttonSize: string;
  buttonPadding: string;
  spacing: string;
  maxWidth: string;
}

interface DesignConfig {
  showFloatingElements: boolean;
  useGradientText: boolean;
  enableHoverEffects: boolean;
  animationIntensity: "subtle" | "dynamic";
  backgroundPattern: boolean;
}

const getSpaceConfig = (variant: SpaceVariantType): SpaceConfig => {
  const configs: Record<SpaceVariantType, SpaceConfig> = {
    sm: {
      containerPadding: "px-4 py-8",
      contentPadding: "p-6",
      numberSize: "text-6xl sm:text-7xl",
      headingSize: "text-xl sm:text-2xl",
      messageSize: "text-sm sm:text-base",
      iconSize: 20,
      buttonSize: "text-sm",
      buttonPadding: "px-4 py-2.5",
      spacing: "space-y-4",
      maxWidth: "max-w-md",
    },
    lg: {
      containerPadding: "px-6 py-12",
      contentPadding: "p-8",
      numberSize: "text-8xl sm:text-9xl",
      headingSize: "text-2xl sm:text-3xl",
      messageSize: "text-base sm:text-lg",
      iconSize: 24,
      buttonSize: "text-base",
      buttonPadding: "px-6 py-3",
      spacing: "space-y-6",
      maxWidth: "max-w-lg",
    },
    xl: {
      containerPadding: "px-8 py-16",
      contentPadding: "p-10 sm:p-12",
      numberSize: "text-9xl sm:text-[10rem]",
      headingSize: "text-3xl sm:text-4xl",
      messageSize: "text-lg sm:text-xl",
      iconSize: 28,
      buttonSize: "text-lg",
      buttonPadding: "px-8 py-4",
      spacing: "space-y-8",
      maxWidth: "max-w-2xl",
    },
  };
  return configs[variant];
};

const getDesignConfig = (variant: DesignVariantType): DesignConfig => {
  const configs: Record<DesignVariantType, DesignConfig> = {
    default: {
      showFloatingElements: true,
      useGradientText: true,
      enableHoverEffects: true,
      animationIntensity: "dynamic",
      backgroundPattern: true,
    },
    minimal: {
      showFloatingElements: false,
      useGradientText: false,
      enableHoverEffects: false,
      animationIntensity: "subtle",
      backgroundPattern: false,
    },
  };
  return configs[variant];
};

const NotFound: React.FC<NotFoundProps> = ({
  onGoHome = () => console.log("Go home"),
  onGoBack = () => console.log("Go back"),
  customMessage,
  className,
  designVariant = "minimal", // Changed to minimal for demo
  spaceVariant = "lg",
}) => {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const spaceConfig = getSpaceConfig(spaceVariant);
  const designConfig = getDesignConfig(designVariant);

  useEffect(() => {
    if (designConfig.animationIntensity === "dynamic") {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [designConfig.animationIntensity]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAnimationProps = (baseProps: any) => {
    if (designConfig.animationIntensity === "subtle") {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: Math.min(baseProps.transition?.duration || 0.3, 0.3),
          ease: "easeOut",
        },
      };
    }
    return baseProps;
  };

  return (
    <motion.div
      className={cn(
        "min-h-screen w-full flex items-center justify-center relative overflow-hidden",
        spaceConfig.containerPadding,
        className
      )}
      style={{ backgroundColor: theme.backgroundColor }}
      {...getAnimationProps({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6 },
      })}
    >
      {/* Background Pattern - Only show if enabled */}
      {designConfig.backgroundPattern && (
        <BackgroundPattern theme={theme} mousePosition={mousePosition} />
      )}

      {/* Floating Elements - Only show if enabled */}
      {designConfig.showFloatingElements && <FloatingElements theme={theme} />}

      {/* Main Content */}
      <motion.div
        className={cn(
          "relative z-10 text-center w-full",
          spaceConfig.maxWidth,
          spaceConfig.spacing
        )}
        {...getAnimationProps({
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.8, delay: 0.2 },
        })}
      >
        {/* 404 Number with Conditional Styling */}
        <div className="relative">
          <motion.div
            className={cn("font-bold tracking-tight", spaceConfig.numberSize)}
            style={{
              // Apply gradient only if useGradientText is true
              background: designConfig.useGradientText
                ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                : "none",
              WebkitBackgroundClip: designConfig.useGradientText
                ? "text"
                : "unset",
              WebkitTextFillColor: designConfig.useGradientText
                ? "transparent"
                : "unset",
              color: designConfig.useGradientText
                ? "transparent"
                : theme.primaryColor,
            }}
            {...getAnimationProps({
              initial: {
                scale: 0.8,
                rotateX: designConfig.animationIntensity === "dynamic" ? 20 : 0,
              },
              animate: { scale: 1, rotateX: 0 },
              transition: {
                duration:
                  designConfig.animationIntensity === "dynamic" ? 1 : 0.6,
                ease:
                  designConfig.animationIntensity === "dynamic"
                    ? "backOut"
                    : "easeOut",
              },
            })}
          >
            404
          </motion.div>

          {/* Decorative Elements - Only show for dynamic animation */}
          {designConfig.animationIntensity === "dynamic" && (
            <>
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 rotate-45"
                style={{ backgroundColor: theme.secondaryColor }}
                animate={{
                  rotate: [45, 90, 45],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </>
          )}
        </div>

        {/* Heading */}
        <motion.h1
          className={cn("font-semibold", spaceConfig.headingSize)}
          style={{ color: theme.textColor }}
          {...getAnimationProps({
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.6, delay: 0.4 },
          })}
        >
          Lost in Space
        </motion.h1>

        {/* Message */}
        <motion.p
          className={cn("leading-relaxed", spaceConfig.messageSize)}
          style={{ color: theme.textDimmed }}
          {...getAnimationProps({
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.6, delay: 0.5 },
          })}
        >
          {customMessage ||
            "The page you're looking for has drifted away into the digital void. Let's navigate you back to familiar territory."}
        </motion.p>

        {/* Navigation Icons */}
        <motion.div
          className="flex justify-center gap-6 my-8"
          {...getAnimationProps({
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.6, delay: 0.6 },
          })}
        >
          <NavigationIcon
            icon={Compass}
            theme={theme}
            designConfig={designConfig}
            size={spaceConfig.iconSize + 8}
          />
          <NavigationIcon
            icon={Search}
            theme={theme}
            designConfig={designConfig}
            size={spaceConfig.iconSize + 8}
            delay={0.1}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...getAnimationProps({
            initial: { y: 30, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.6, delay: 0.7 },
          })}
        >
          <ActionButton
            onClick={onGoHome}
            icon={Home}
            text="Return Home"
            variant="primary"
            theme={theme}
            spaceConfig={spaceConfig}
            designConfig={designConfig}
          />

          <ActionButton
            onClick={onGoBack}
            icon={ArrowLeft}
            text="Go Back"
            variant="secondary"
            theme={theme}
            spaceConfig={spaceConfig}
            designConfig={designConfig}
          />
        </motion.div>

        {/* Design Variant Toggle for Demo */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Current Design: <strong>{designVariant}</strong>
          </p>
          <p className="text-xs text-gray-400">
            Minimal: No gradients, reduced animations, no floating elements
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Background Pattern Component
const BackgroundPattern: React.FC<{
  theme: Theme;
  mousePosition: { x: number; y: number };
}> = ({ theme, mousePosition }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.textColor} 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          transform: `translate(${mousePosition.x * 0.02}px, ${
            mousePosition.y * 0.02
          }px)`,
        }}
      />

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03] blur-3xl"
        style={{
          background: `radial-gradient(circle, ${theme.primaryColor}, transparent 70%)`,
        }}
        animate={{
          x: mousePosition.x * 0.1,
          y: mousePosition.y * 0.1,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.04] blur-3xl"
        style={{
          background: `radial-gradient(circle, ${theme.secondaryColor}, transparent 70%)`,
        }}
        animate={{
          x: -mousePosition.x * 0.08,
          y: -mousePosition.y * 0.08,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      />
    </div>
  );
};

// Floating Elements Component
const FloatingElements: React.FC<{
  theme: Theme;
}> = ({ theme }) => {
  const elements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.2,
    color:
      i % 3 === 0
        ? theme.primaryColor
        : i % 3 === 1
        ? theme.secondaryColor
        : theme.accentColor,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full"
          style={{
            width: element.size,
            height: element.size,
            backgroundColor: element.color,
            opacity: element.opacity,
            left: `${10 + ((element.id * 11) % 80)}%`,
            top: `${15 + ((element.id * 13) % 70)}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [element.opacity, element.opacity * 0.5, element.opacity],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Navigation Icon Component
const NavigationIcon: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  theme: Theme;
  designConfig: DesignConfig;
  size: number;
  delay?: number;
}> = ({ icon: Icon, theme, designConfig, size, delay = 0 }) => {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        duration: designConfig.animationIntensity === "subtle" ? 0.3 : 0.5,
        delay: 0.6 + delay,
        type:
          designConfig.animationIntensity === "subtle" ? "easeOut" : "spring",
      }}
    >
      <motion.div
        className="p-4 rounded-full"
        style={{
          backgroundColor: `${theme.primaryColor}10`,
          border: `1px solid ${theme.primaryColor}20`,
        }}
        whileHover={
          designConfig.enableHoverEffects
            ? {
                scale: 1.1,
                backgroundColor: `${theme.primaryColor}15`,
              }
            : undefined
        }
        animate={
          designConfig.animationIntensity === "dynamic"
            ? {
                rotate: [0, 5, -5, 0],
              }
            : {}
        }
        transition={
          designConfig.animationIntensity === "dynamic"
            ? {
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }
            : {}
        }
      >
        <Icon size={size} style={{ color: theme.primaryColor }} />
      </motion.div>
    </motion.div>
  );
};

// Action Button Component
const ActionButton: React.FC<{
  onClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  text: string;
  variant: "primary" | "secondary";
  theme: Theme;
  spaceConfig: SpaceConfig;
  designConfig: DesignConfig;
}> = ({
  onClick,
  icon: Icon,
  text,
  variant,
  theme,
  spaceConfig,
  designConfig,
}) => {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 font-medium rounded-lg transition-all duration-300 min-w-[140px] justify-center",
        spaceConfig.buttonPadding,
        spaceConfig.buttonSize
      )}
      style={{
        backgroundColor: isPrimary ? theme.primaryColor : "transparent",
        color: isPrimary ? "#ffffff" : theme.textColor,
        border: isPrimary ? "none" : `1px solid ${theme.primaryColor}30`,
      }}
      whileHover={
        designConfig.enableHoverEffects
          ? {
              scale: 1.05,
              backgroundColor: isPrimary
                ? theme.primaryShade
                : `${theme.primaryColor}10`,
              boxShadow: isPrimary
                ? `0 8px 25px ${theme.primaryColor}30`
                : `0 4px 15px ${theme.primaryColor}20`,
            }
          : { scale: 1.02 }
      }
      whileTap={{ scale: 0.98 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: designConfig.animationIntensity === "subtle" ? 0.3 : 0.5,
      }}
    >
      <Icon size={spaceConfig.iconSize} />
      <span>{text}</span>
    </motion.button>
  );
};

export default NotFound;
