import React from "react";
import { motion } from "framer-motion";

// Dark theme color palette with blue accent
const colors = {
  accentColor: "#3b82f6", // blue-500
  primaryColor: "#60a5fa", // blue-400
  secondaryColor: "#1d4ed8", // blue-700
  textColor: "#f8fafc", // slate-50
  textDimmed: "#64748b", // slate-500
  backgroundColor: "#0f172a", // slate-900
};

type LoadingPattern = "pulse" | "wave" | "spinner" | "dots" | "bars" | "matrix";
export type DesignVariantType = "default" | "minimal";
export type SpaceVariantType = "sm" | "lg" | "xl";

type LoadingProps = {
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  pattern?: LoadingPattern;
  loadingMessage?: string;
  showMessage?: boolean;
  className?: string;
};

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      variant = "default",
      scale = "lg",
      pattern = "pulse",
      loadingMessage = "",
      showMessage = true,
      className,
    },
    ref
  ) => {
    const getScaleConfig = () => {
      switch (scale) {
        case "sm":
          return {
            size: 32,
            container: 48,
            text: "text-xs",
            dotSize: 2,
            barWidth: 1.5,
            strokeWidth: 1.5,
            fontSize: 8,
          };
        case "lg":
          return {
            size: 64,
            container: 80,
            text: "text-base",
            dotSize: 3,
            barWidth: 2,
            strokeWidth: 2,
            fontSize: 10,
          };
        case "xl":
          return {
            size: 80,
            container: 96,
            text: "text-lg",
            dotSize: 4,
            barWidth: 3,
            strokeWidth: 3,
            fontSize: 12,
          };
        default:
          return {
            size: 64,
            container: 80,
            text: "text-base",
            dotSize: 3,
            barWidth: 2,
            strokeWidth: 2,
            fontSize: 10,
          };
      }
    };

    const scaleConfig = getScaleConfig();

    const renderPulse = () => {
      const coreSize = scaleConfig.size * 0.4;
      const middleSize = scaleConfig.size * 0.6;
      const outerSize = scaleConfig.size * 0.8;

      return (
        <div
          className="relative flex items-center justify-center"
          style={{
            width: scaleConfig.container,
            height: scaleConfig.container,
          }}
        >
          {/* Outer ping circle */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: outerSize,
              height: outerSize,
              backgroundColor: colors.accentColor + "33",
            }}
            animate={{
              scale: [1, 1.8],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Middle pulsing glow circle */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: middleSize,
              height: middleSize,
              backgroundColor: colors.accentColor,
              boxShadow: `0 0 ${scaleConfig.size * 0.25}px ${
                colors.accentColor
              }88`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Inner solid core circle */}
          <div
            className="absolute rounded-full"
            style={{
              width: coreSize,
              height: coreSize,
              backgroundColor: colors.accentColor,
            }}
          />
        </div>
      );
    };

    const renderWave = () => (
      <div
        className="relative flex items-center justify-center"
        style={{ width: scaleConfig.container, height: scaleConfig.container }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            <linearGradient
              id={`waveGrad-${scale}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={colors.accentColor}
                stopOpacity="0"
              />
              <stop
                offset="50%"
                stopColor={colors.accentColor}
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor={colors.accentColor}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={i}
              d={`M10,50 Q30,${30 + i * 5} 50,50 T90,50`}
              fill="none"
              stroke={`url(#waveGrad-${scale})`}
              strokeWidth={scaleConfig.strokeWidth}
              animate={{
                d: [
                  `M10,50 Q30,${30 + i * 5} 50,50 T90,50`,
                  `M10,50 Q30,${70 - i * 5} 50,50 T90,50`,
                  `M10,50 Q30,${30 + i * 5} 50,50 T90,50`,
                ],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </svg>
      </div>
    );

    const renderSpinner = () => {
      return (
        <div
          className="animate-spin rounded-full border-t-4  border-solid border-opacity-75 shadow-lg"
          style={{
            width: scaleConfig.container,
            height: scaleConfig.container,
            borderColor: colors.textDimmed,
            borderTopColor: colors.accentColor,
            boxShadow: `0 0 ${scaleConfig.size * 0.2}px ${
              colors.accentColor
            }50`,
          }}
        ></div>
      );
    };

    const renderDots = () => (
      <div
        className="relative flex items-center justify-center"
        style={{
          width: scaleConfig.container,
          height: scaleConfig.container,
        }}
      >
        <div className="flex space-x-2 items-end">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: scaleConfig.dotSize * 4,
                height: scaleConfig.dotSize * 4,
                backgroundColor: colors.accentColor,
                boxShadow: `0 0 ${scaleConfig.dotSize * 2}px ${
                  colors.accentColor
                }50`,
              }}
              animate={{
                y: [0, -scaleConfig.dotSize * 3, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    );

    const renderBars = () => (
      <div
        className="flex items-end justify-center space-x-1"
        style={{
          width: scaleConfig.container,
          height: scaleConfig.container,
          paddingBottom: scaleConfig.size * 0.1,
        }}
      >
        {[...Array(5)].map((_, i) => {
          const baseHeight = scaleConfig.size * 0.3;
          const maxHeight = scaleConfig.size * 0.8;

          return (
            <motion.div
              key={i}
              className="rounded-t"
              style={{
                width: scaleConfig.barWidth * 4,
                backgroundColor: colors.accentColor,
                boxShadow: `0 0 ${scaleConfig.barWidth * 2}px ${
                  colors.accentColor
                }40`,
              }}
              animate={{
                height: [
                  baseHeight + (i % 3) * (scaleConfig.size * 0.1),
                  maxHeight - (i % 2) * (scaleConfig.size * 0.2),
                  baseHeight + (i % 3) * (scaleConfig.size * 0.1),
                ],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          );
        })}
      </div>
    );

    const renderMatrix = () => (
      <div
        className="relative overflow-hidden rounded"
        style={{
          width: scaleConfig.container,
          height: scaleConfig.container,
          backgroundColor: colors.backgroundColor + "40",
          border: `1px solid ${colors.textDimmed}20`,
        }}
      >
        {Array.from({ length: 6 }).map((_, col) => (
          <motion.div
            key={col}
            className="absolute top-0 text-center font-mono font-bold"
            style={{
              left: `${col * 16.66}%`,
              width: "16.66%",
              color: colors.accentColor,
              fontSize: `${scaleConfig.fontSize}px`,
              textShadow: `0 0 ${scaleConfig.fontSize * 0.5}px currentColor`,
            }}
            animate={{
              y: ["-100%", "100%"],
            }}
            transition={{
              duration: 2 + col * 0.3,
              repeat: Infinity,
              ease: "linear",
              delay: col * 0.2,
            }}
          >
            {Array.from({ length: 8 }).map((_, row) => (
              <motion.div
                key={row}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1 + row * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: row * 0.1,
                }}
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    );

    const renderPattern = () => {
      const patternMap: Record<LoadingPattern, () => JSX.Element> = {
        pulse: renderPulse,
        wave: renderWave,
        spinner: renderSpinner,
        dots: renderDots,
        bars: renderBars,
        matrix: renderMatrix,
      };

      return patternMap[pattern]();
    };

    const renderMessage = () => {
      if (!showMessage || !loadingMessage) return null;

      return (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {loadingMessage && (
            <motion.div
              className={`font-medium ${scaleConfig.text}`}
              style={{ color: colors.textColor }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {loadingMessage}
            </motion.div>
          )}
          {variant !== "minimal" && (
            <div className="flex justify-center mt-2 space-x-1">
              {[0, 1, 2].map((i) => {
                const colorList = [
                  colors.accentColor,
                  colors.primaryColor,
                  colors.secondaryColor,
                ];
                return (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: scaleConfig.dotSize,
                      height: scaleConfig.dotSize,
                      backgroundColor: colorList[i],
                    }}
                    animate={{
                      y: [-4, 0, -4],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      );
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        return (
          <motion.div
            ref={ref}
            className={`flex flex-col items-center justify-center p-6 ${
              className || ""
            }`}
            style={{
              backgroundColor: colors.backgroundColor + "05",
              borderRadius: "12px",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              style={{
                filter: `drop-shadow(0 0 ${scaleConfig.size * 0.3}px ${
                  colors.accentColor
                }40)`,
              }}
            >
              {renderPattern()}
            </div>
            {renderMessage()}
          </motion.div>
        );

      case "minimal":
        return (
          <motion.div
            ref={ref}
            className={`flex flex-col items-center justify-center p-4 ${
              className || ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div style={{ opacity: 0.8 }}>{renderPattern()}</div>
            {renderMessage()}
          </motion.div>
        );

      default:
        return null;
    }
  }
);

Loading.displayName = "Loading";

export { Loading };
