import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Star,
  Target,
} from "lucide-react";
import useTheme, { type Theme } from "./lib/useTheme";
import { cn } from "./lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "./Variant/variantType";

// Helper type to exclude conflicting events between React and Framer Motion
type ExcludeMotionConflicts<T> = Omit<
  T,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
>;

type TimelineOrientationType = "horizontal" | "vertical";

type TimelineStep = {
  title: string;
  description?: string;
  date?: string;
  status?: "completed" | "active" | "pending";
  // Innovation: Enhanced step properties
  duration?: number; // For auto-progression
  milestone?: boolean; // Special milestone steps
  category?: string; // Step categorization
  priority?: "low" | "medium" | "high" | "critical";
  progress?: number; // 0-100 for partial completion
  metadata?: Record<string, any>; // Additional data
};

type TimelineProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  steps: TimelineStep[];
  currentStep?: number;
  orientation?: TimelineOrientationType;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  interactive?: boolean;
  expandable?: boolean;
  animateOnMount?: boolean;
  glowEffect?: boolean;
  // Innovation: New props
  autoProgress?: boolean; // Auto-advance through steps
  autoProgressInterval?: number; // Milliseconds between auto-advance
  showProgress?: boolean; // Show overall progress
  allowSkip?: boolean; // Allow clicking future steps
  showMilestones?: boolean; // Highlight milestone steps
  particleEffect?: boolean; // Add particle effects
  soundEffects?: boolean; // Play sounds on step changes
  vibrantConnections?: boolean; // Animated connection lines
  minimap?: boolean; // Show minimap for long timelines
  onStepChange?: (stepIndex: number) => void;
  onComplete?: () => void;
};

type TimelineStepProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  step: TimelineStep;
  index: number;
  isLast: boolean;
  status: "completed" | "active" | "pending";
  orientation: TimelineOrientationType;
  scale: SpaceVariantType;
  interactive: boolean;
  expandable: boolean;
  isExpanded: boolean;
  onToggle: (index: number) => void;
  // Innovation: Enhanced props
  allowSkip: boolean;
  showMilestones: boolean;
  particleEffect: boolean;
  vibrantConnections: boolean;
  onStepClick?: (index: number) => void;
};

// Innovation: Particle system for visual effects
const ParticleEffect: React.FC<{ active: boolean; theme: Theme }> = ({
  active,
  theme,
}) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: theme.primaryColor }}
          initial={{
            x: "50%",
            y: "50%",
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Innovation: Progress ring component
const ProgressRing: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}> = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={`${color}20`}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ strokeDasharray }}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
};

// Innovation: Minimap component
const TimelineMinimap: React.FC<{
  steps: TimelineStep[];
  currentStep: number;
  theme: Theme;
  onStepClick: (index: number) => void;
}> = ({ steps, currentStep, theme, onStepClick }) => {
  return (
    <div
      className="fixed top-4 right-4 bg-opacity-90 backdrop-blur-sm rounded-lg p-2 z-50"
      style={{
        backgroundColor: theme.backgroundColor,
        border: `1px solid ${theme.secondaryColor}40`,
      }}
    >
      <div className="flex flex-col gap-1">
        {steps.map((step, index) => (
          <motion.button
            key={index}
            className="w-3 h-3 rounded-full border transition-all"
            style={{
              backgroundColor:
                index <= currentStep ? theme.primaryColor : "transparent",
              borderColor:
                index === currentStep ? theme.primaryColor : theme.textDimmed,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onStepClick(index)}
            title={step.title}
          />
        ))}
      </div>
    </div>
  );
};

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      steps,
      currentStep = 0,
      orientation = "vertical",
      variant = "default",
      scale = "lg",
      interactive = false,
      expandable = false,
      animateOnMount = true,
      glowEffect = false,
      // Innovation: New props with defaults
      autoProgress = false,
      autoProgressInterval = 3000,
      showProgress = true,
      allowSkip = false,
      showMilestones = true,
      particleEffect = false,
      soundEffects = false,
      vibrantConnections = true,
      minimap = false,
      onStepChange,
      onComplete,
      className,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [internalCurrentStep, setInternalCurrentStep] = useState(currentStep);
    const [isPlaying, setIsPlaying] = useState(autoProgress);
    const [hasCompleted, setHasCompleted] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(timelineRef, { once: true, margin: "-100px" });

    // Innovation: Auto-progression logic
    useEffect(() => {
      if (isPlaying && internalCurrentStep < steps.length - 1) {
        const stepDuration =
          steps[internalCurrentStep]?.duration || autoProgressInterval;
        intervalRef.current = setTimeout(() => {
          const nextStep = internalCurrentStep + 1;
          setInternalCurrentStep(nextStep);
          onStepChange?.(nextStep);

          // Play sound effect (innovation)
          if (soundEffects && typeof Audio !== "undefined") {
            try {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeCC2B0fPTdSUDMGm98tCrYg0PNIrV8stsBgAqnNbr3LgfBS12x+7soxQRWqrc65pVFApGn+DyvmMeCC2B0fPTdSUDMGm98tCrYg0PNIrV8stsBgAqnNbr3LgfBS12x+7soxQRWqrc65pVFApGn+DyvmMeCC2B0fPTdSUDMGm98tCrYg0PNIrV8stsBgAqnNbr3LgfBS12x+7soxQRWqrc65pVFApGn+DyvmMeCC2B0fPTdSUDMGm98tCrYg0PNIrV8stsBgAqnNbr3LgfBS12x+7soxQRWqrc65pVFApGn+DyvmMeCC2B0fPTdSUDMGm98tCrYg0PNIrV8stsBgAqnNbr"
              );
              audio.volume = 0.1;
              audio.play().catch(() => {}); // Ignore errors
            } catch (e) {
              // Ignore audio errors
            }
          }

          if (nextStep === steps.length - 1) {
            setIsPlaying(false);
            setHasCompleted(true);
            onComplete?.();
          }
        }, stepDuration);
      }

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }, [
      isPlaying,
      internalCurrentStep,
      steps.length,
      autoProgressInterval,
      onStepChange,
      onComplete,
      soundEffects,
    ]);

    // Innovation: Sync external currentStep changes
    useEffect(() => {
      setInternalCurrentStep(currentStep);
    }, [currentStep]);

    const handleStepToggle = (index: number) => {
      if (expandable) {
        setExpandedStep(expandedStep === index ? null : index);
      }
    };

    const handleStepClick = (index: number) => {
      if (allowSkip || index <= internalCurrentStep + 1) {
        setInternalCurrentStep(index);
        onStepChange?.(index);
      }
    };

    const togglePlayPause = () => {
      setIsPlaying(!isPlaying);
    };

    const resetTimeline = () => {
      setInternalCurrentStep(0);
      setIsPlaying(false);
      setHasCompleted(false);
      onStepChange?.(0);
    };

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            borderRadius: "0.5rem",
            padding: "0.75rem",
            gap: orientation === "horizontal" ? "1rem" : "1.5rem",
          };
        case "lg":
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
            gap: orientation === "horizontal" ? "1.5rem" : "2rem",
          };
        case "xl":
          return {
            borderRadius: "1rem",
            padding: "1.25rem",
            gap: orientation === "horizontal" ? "2rem" : "2.5rem",
          };
        default:
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
            gap: orientation === "horizontal" ? "1.5rem" : "2rem",
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();

      switch (variant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: `0 2px 4px -1px ${theme.secondaryShade}20`,
            ...(glowEffect && {
              boxShadow: `0 0 20px ${theme.primaryColor}20, 0 2px 4px -1px ${theme.secondaryShade}20`,
            }),
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            border: `1px solid ${theme.secondaryColor}20`,
            boxShadow: "none",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: `0 2px 4px -1px ${theme.secondaryShade}20`,
          };
      }
    };

    const getStepStatus = (
      index: number
    ): "completed" | "active" | "pending" => {
      const step = steps[index];
      if (step.status) return step.status;

      if (index < internalCurrentStep) return "completed";
      if (index === internalCurrentStep) return "active";
      return "pending";
    };

    const containerStyles = getVariantStyles();
    const completionPercentage = Math.round(
      ((internalCurrentStep + 1) / steps.length) * 100
    );

    return (
      <>
        <motion.div
          ref={timelineRef}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            orientation === "horizontal" ? "flex items-start" : "flex flex-col",
            className
          )}
          style={containerStyles}
          initial={animateOnMount ? { opacity: 0, y: 20 } : {}}
          animate={animateOnMount && isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: "easeOut" }}
          {...props}
        >
          {/* Innovation: Enhanced background effects */}
          {glowEffect && variant === "default" && (
            <motion.div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                background: theme.primaryGradient,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Innovation: Progress header */}
          {showProgress && (
            <motion.div
              className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor: `${theme.primaryColor}10`,
                borderColor: `${theme.primaryColor}30`,
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="font-semibold"
                  style={{ color: theme.textColor }}
                >
                  Timeline Progress
                </h3>
                <div className="flex items-center gap-2">
                  {autoProgress && (
                    <motion.button
                      onClick={togglePlayPause}
                      className="p-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: `${theme.primaryColor}20`,
                        color: theme.primaryColor,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={resetTimeline}
                    className="p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: `${theme.textDimmed}20`,
                      color: theme.textDimmed,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RotateCcw size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="flex-1 h-2 rounded-full mr-4"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme.primaryColor }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.primaryColor }}
                >
                  {completionPercentage}%
                </span>
              </div>

              {hasCompleted && (
                <motion.div
                  className="mt-2 flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CheckCircle
                    size={16}
                    style={{ color: theme.successColor }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.successColor }}
                  >
                    Timeline Completed!
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Timeline Steps */}
          <div
            className={cn(
              "relative z-10 w-full",
              orientation === "horizontal"
                ? "flex justify-between items-start"
                : "flex flex-col"
            )}
            style={{
              gap: containerStyles.gap,
            }}
          >
            {steps.map((step, index) => (
              <TimelineStepComponent
                key={`timeline-step-${index}`}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
                status={getStepStatus(index)}
                orientation={orientation}
                scale={scale}
                interactive={interactive}
                expandable={expandable}
                isExpanded={expandedStep === index}
                onToggle={handleStepToggle}
                allowSkip={allowSkip}
                showMilestones={showMilestones}
                particleEffect={particleEffect}
                vibrantConnections={vibrantConnections}
                onStepClick={handleStepClick}
              />
            ))}
          </div>
        </motion.div>

        {/* Innovation: Minimap */}
        {minimap && steps.length > 5 && (
          <TimelineMinimap
            steps={steps}
            currentStep={internalCurrentStep}
            theme={theme}
            onStepClick={handleStepClick}
          />
        )}
      </>
    );
  }
);

const TimelineStepComponent = React.forwardRef<
  HTMLDivElement,
  TimelineStepProps
>(
  (
    {
      step,
      index,
      isLast,
      status,
      orientation,
      scale,
      interactive,
      expandable,
      isExpanded,
      onToggle,
      allowSkip,
      showMilestones,
      particleEffect,
      vibrantConnections,
      onStepClick,
      className,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const stepRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(stepRef, { once: true, margin: "-50px" });

    const getScaleConfig = () => {
      switch (scale) {
        case "sm":
          return {
            nodeSize: 20,
            iconSize: 12,
            lineWidth: 2,
            titleSize: "0.75rem",
            descriptionSize: "0.625rem",
            dateSize: "0.5rem",
            spacing: "0.5rem",
            padding: "0.5rem",
          };
        case "lg":
          return {
            nodeSize: 28,
            iconSize: 16,
            lineWidth: 3,
            titleSize: "0.875rem",
            descriptionSize: "0.75rem",
            dateSize: "0.625rem",
            spacing: "0.75rem",
            padding: "0.75rem",
          };
        case "xl":
          return {
            nodeSize: 32,
            iconSize: 20,
            lineWidth: 4,
            titleSize: "1rem",
            descriptionSize: "0.875rem",
            dateSize: "0.75rem",
            spacing: "1rem",
            padding: "1rem",
          };
        default:
          return {
            nodeSize: 28,
            iconSize: 16,
            lineWidth: 3,
            titleSize: "0.875rem",
            descriptionSize: "0.75rem",
            dateSize: "0.625rem",
            spacing: "0.75rem",
            padding: "0.75rem",
          };
      }
    };

    const config = getScaleConfig();

    // Innovation: Enhanced status icons with priority and progress
    const getStatusIcon = () => {
      const baseIcon = (() => {
        switch (status) {
          case "completed":
            return (
              <CheckCircle
                size={config.iconSize}
                style={{ color: theme.successColor }}
              />
            );
          case "active":
            return (
              <Clock
                size={config.iconSize}
                style={{ color: theme.primaryColor }}
              />
            );
          default:
            return (
              <Circle
                size={config.iconSize}
                style={{ color: theme.textDimmed }}
              />
            );
        }
      })();

      // Add priority indicators
      if (step.priority === "critical" && status !== "completed") {
        return (
          <div className="relative">
            {baseIcon}
            <Zap
              size={config.iconSize * 0.6}
              className="absolute -top-1 -right-1"
              style={{ color: theme.warningColor }}
            />
          </div>
        );
      }

      // Add milestone indicators
      if (step.milestone && showMilestones) {
        return (
          <div className="relative">
            {baseIcon}
            <Star
              size={config.iconSize * 0.6}
              className="absolute -top-1 -right-1"
              style={{ color: theme.primaryColor }}
            />
          </div>
        );
      }

      return baseIcon;
    };

    const getStatusColors = () => {
      // Innovation: Priority-based color variations
      const priorityMultiplier =
        step.priority === "critical" ? 1.2 : step.priority === "high" ? 1.1 : 1;

      switch (status) {
        case "completed":
          return {
            nodeBackground: `${theme.successColor}${Math.round(
              20 * priorityMultiplier
            )
              .toString(16)
              .padStart(2, "0")}`,
            ringColor: theme.successColor,
            lineColor: theme.successColor,
            textColor: theme.successColor,
          };
        case "active":
          return {
            nodeBackground: `${theme.primaryColor}${Math.round(
              20 * priorityMultiplier
            )
              .toString(16)
              .padStart(2, "0")}`,
            ringColor: theme.primaryColor,
            lineColor: theme.primaryColor,
            textColor: theme.primaryColor,
          };
        default:
          return {
            nodeBackground: `${theme.textDimmed}20`,
            ringColor: theme.textDimmed,
            lineColor: `${theme.textDimmed}40`,
            textColor: theme.textDimmed,
          };
      }
    };

    const colors = getStatusColors();

    const handleClick = () => {
      if (expandable || interactive) {
        onToggle(index);
      }
      if (onStepClick && (allowSkip || status !== "pending")) {
        onStepClick(index);
      }
    };

    return (
      <motion.div
        ref={stepRef}
        className={cn(
          "relative flex-1 transition-all duration-200",
          orientation === "horizontal" ? "text-center" : "flex items-start",
          (interactive || expandable || allowSkip) && "cursor-pointer",
          className
        )}
        initial={
          orientation === "vertical"
            ? { opacity: 0, x: -20 }
            : { opacity: 0, y: 20 }
        }
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: "easeOut",
        }}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive || expandable || allowSkip ? { scale: 0.98 } : {}}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        {...props}
      >
        {/* Innovation: Enhanced connection line with animations */}
        {!isLast && (
          <motion.div
            className={cn(
              "absolute z-0",
              orientation === "horizontal"
                ? "h-px top-3 left-1/2 right-0 transform translate-x-4"
                : "w-px left-3 top-6 bottom-0 transform translate-y-2"
            )}
            style={{
              backgroundColor: colors.lineColor,
              width:
                orientation === "horizontal"
                  ? "calc(100% - 2rem)"
                  : config.lineWidth,
              height:
                orientation === "vertical"
                  ? "calc(100% - 1.5rem)"
                  : config.lineWidth,
            }}
            initial={{
              scaleX: orientation === "horizontal" ? 0 : 1,
              scaleY: orientation === "vertical" ? 0 : 1,
            }}
            animate={{ scaleX: 1, scaleY: 1 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            {/* Innovation: Flowing animation on active connections */}
            {vibrantConnections && status === "completed" && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`,
                }}
                animate={{
                  x: orientation === "horizontal" ? ["0%", "100%"] : 0,
                  y: orientation === "vertical" ? ["0%", "100%"] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
          </motion.div>
        )}

        {/* Innovation: Enhanced step node with progress ring */}
        <motion.div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full",
            orientation === "horizontal" ? "mx-auto mb-2" : "mr-3 flex-shrink-0"
          )}
          style={{
            width: config.nodeSize,
            height: config.nodeSize,
            backgroundColor: colors.nodeBackground,
            border: `2px solid ${colors.ringColor}`,
            boxShadow:
              status === "active" && isHovered
                ? `0 0 12px ${theme.primaryColor}40`
                : step.milestone && showMilestones
                ? `0 0 8px ${theme.primaryColor}30`
                : "none",
          }}
          animate={
            status === "active"
              ? {
                  boxShadow: [
                    `0 0 0px ${theme.primaryColor}20`,
                    `0 0 8px ${theme.primaryColor}40`,
                    `0 0 0px ${theme.primaryColor}20`,
                  ],
                }
              : {}
          }
          transition={
            status === "active"
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : {}
          }
        >
          {/* Innovation: Progress ring for partial completion */}
          {step.progress !== undefined &&
            step.progress > 0 &&
            step.progress < 100 && (
              <ProgressRing
                progress={step.progress}
                size={config.nodeSize}
                strokeWidth={2}
                color={colors.ringColor}
              />
            )}

          {/* Innovation: Particle effects */}
          {particleEffect && status === "active" && (
            <ParticleEffect active={true} theme={theme} />
          )}

          {getStatusIcon()}

          {/* Innovation: Milestone glow effect */}
          {step.milestone && showMilestones && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.primaryColor}20, transparent)`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>

        {/* Step Content */}
        <div
          className={cn(
            "flex-1",
            orientation === "horizontal" ? "text-center" : "text-left"
          )}
        >
          {/* Innovation: Enhanced step header with metadata */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <motion.h4
                className="font-medium leading-tight"
                style={{
                  fontSize: config.titleSize,
                  color:
                    status === "pending" ? theme.textDimmed : theme.textColor,
                }}
                animate={status === "active" ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {step.title}
                {/* Innovation: Priority badge */}
                {step.priority === "critical" && (
                  <span
                    className="ml-2 px-1.5 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `${theme.warningColor}20`,
                      color: theme.warningColor,
                      fontSize: config.dateSize,
                    }}
                  >
                    Critical
                  </span>
                )}
              </motion.h4>

              {/* Innovation: Category tag */}
              {step.category && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                    fontSize: config.dateSize,
                  }}
                >
                  {step.category}
                </span>
              )}
            </div>

            {/* Innovation: Expandable toggle */}
            {expandable && (step.description || step.metadata) && (
              <motion.button
                className="ml-2 p-1 rounded-full transition-colors"
                style={{
                  backgroundColor: isExpanded
                    ? `${theme.primaryColor}20`
                    : `${theme.textDimmed}10`,
                  color: isExpanded ? theme.primaryColor : theme.textDimmed,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(index);
                }}
              >
                {isExpanded ? (
                  <ChevronUp size={config.iconSize * 0.75} />
                ) : (
                  <ChevronDown size={config.iconSize * 0.75} />
                )}
              </motion.button>
            )}
          </div>

          {/* Innovation: Date with enhanced formatting */}
          {step.date && (
            <p
              className="mb-1 font-medium"
              style={{
                fontSize: config.dateSize,
                color: colors.textColor,
              }}
            >
              {step.date}
              {/* Innovation: Duration indicator */}
              {step.duration && (
                <span
                  className="ml-2 opacity-75"
                  style={{ color: theme.textDimmed }}
                >
                  ({step.duration}ms)
                </span>
              )}
            </p>
          )}

          {/* Innovation: Progress bar for partial completion */}
          {step.progress !== undefined &&
            step.progress > 0 &&
            step.progress < 100 && (
              <div className="mb-2">
                <div
                  className="h-1 rounded-full mb-1"
                  style={{ backgroundColor: `${colors.ringColor}20` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.ringColor }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: theme.textDimmed,
                    fontSize: config.dateSize,
                  }}
                >
                  {step.progress}% Complete
                </span>
              </div>
            )}

          {/* Description - Always visible or expandable */}
          <AnimatePresence>
            {step.description && (!expandable || isExpanded) && (
              <motion.p
                className="leading-relaxed"
                style={{
                  fontSize: config.descriptionSize,
                  color:
                    status === "pending"
                      ? theme.textDimmed
                      : theme.textColor,
                  marginBottom: config.spacing,
                }}
                initial={expandable ? { opacity: 0, height: 0 } : {}}
                animate={expandable ? { opacity: 1, height: "auto" } : {}}
                exit={expandable ? { opacity: 0, height: 0 } : {}}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step.description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Innovation: Metadata section */}
          <AnimatePresence>
            {step.metadata && isExpanded && expandable && (
              <motion.div
                className="mt-2 p-2 rounded border"
                style={{
                  backgroundColor: `${theme.secondaryColor}10`,
                  borderColor: `${theme.secondaryColor}30`,
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h5
                  className="font-medium mb-1"
                  style={{
                    fontSize: config.dateSize,
                    color: theme.textColor,
                  }}
                >
                  Additional Details
                </h5>
                <div className="space-y-1">
                  {Object.entries(step.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span
                        className="capitalize"
                        style={{
                          fontSize: config.dateSize,
                          color: theme.textDimmed,
                        }}
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span
                        style={{
                          fontSize: config.dateSize,
                          color: theme.textColor,
                        }}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Innovation: Interactive action buttons */}
          {interactive && status === "active" && (
            <motion.div
              className="mt-2 flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
                style={{
                  backgroundColor: `${theme.primaryColor}20`,
                  color: theme.primaryColor,
                }}
                whileHover={{
                  backgroundColor: `${theme.primaryColor}30`,
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStepClick?.(index);
                }}
              >
                <Target size={10} className="inline mr-1" />
                Focus
              </motion.button>

              {step.milestone && (
                <motion.button
                  className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: `${theme.warningColor}20`,
                    color: theme.warningColor,
                  }}
                  whileHover={{
                    backgroundColor: `${theme.warningColor}30`,
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star size={10} className="inline mr-1" />
                  Milestone
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Innovation: Hover effects overlay */}
        {isHovered && (interactive || expandable || allowSkip) && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              backgroundColor: `${theme.primaryColor}05`,
              border: `1px solid ${theme.primaryColor}20`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  }
);

Timeline.displayName = "Timeline";

// Innovation: Enhanced Timeline with preset configurations
const TimelinePresets = {
  // Project timeline with milestones
  project: (steps: Omit<TimelineStep, "milestone" | "priority">[]) => ({
    steps: steps.map((step, index) => ({
      ...step,
      milestone: index % 3 === 0, // Every 3rd step is a milestone
      priority: index === 0 ? ("critical" as const) : ("medium" as const),
    })),
    showMilestones: true,
    particleEffect: true,
    vibrantConnections: true,
    showProgress: true,
    minimap: steps.length > 8,
  }),

  // Auto-progressing demo timeline
  demo: (steps: TimelineStep[]) => ({
    steps: steps.map((step) => ({
      ...step,
      duration: step.duration || 2000,
    })),
    autoProgress: true,
    autoProgressInterval: 2000,
    soundEffects: false, // Disabled by default for demos
    particleEffect: true,
    showProgress: true,
    allowSkip: true,
  }),

  // Minimal timeline for documentation
  minimal: (steps: TimelineStep[]) => ({
    steps,
    variant: "minimal" as const,
    scale: "sm" as const,
    animateOnMount: false,
    showProgress: false,
    vibrantConnections: false,
  }),

  // Interactive learning timeline
  interactive: (steps: TimelineStep[]) => ({
    steps: steps.map((step) => ({
      ...step,
      metadata: step.metadata || { type: "lesson", difficulty: "beginner" },
    })),
    interactive: true,
    expandable: true,
    allowSkip: true,
    showMilestones: true,
    glowEffect: true,
  }),
};

export type { TimelineProps, TimelineStep };
export {Timeline, TimelinePresets};
