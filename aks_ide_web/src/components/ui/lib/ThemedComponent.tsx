import { useState } from "react";
import { GradientPicker } from "./ColorPicker";
import useTheme from "./useTheme";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../Dialog/Dialog";
import { Button } from "../Button/Button";
import { Label } from "../Label/Label";
import { Input } from "../Input/Input";

export const ThemedComponent = () => {
  const [themeOpen, setThemeOpen] = useState(false);
  const {
    theme,
    updateBackgroundColor,
    updateSecondaryColor,
    updateSecondaryShade,
    updateTextColor,
    updateTextDimmed,
    updatePrimaryColor,
    updatePrimaryShade,
    updatePrimaryGradient,
    updateAccentColor,
    updateErrorColor,
    updateSuccessColor,
    updateWarningColor,
    updateInfoColor,
    resetToDefault,
  } = useTheme();

  const themeColorOptions = [
    {
      label: "Background Color",
      value: theme.backgroundColor,
      handler: updateBackgroundColor,
    },
    {
      label: "Secondary Color",
      value: theme.secondaryColor,
      handler: updateSecondaryColor,
    },
    {
      label: "Secondary Shade",
      value: theme.secondaryShade,
      handler: updateSecondaryShade,
    },
    { label: "Text Color", value: theme.textColor, handler: updateTextColor },
    {
      label: "Dimmed Text",
      value: theme.textDimmed,
      handler: updateTextDimmed,
    },
    {
      label: "Primary Color",
      value: theme.primaryColor,
      handler: updatePrimaryColor,
    },
    {
      label: "Primary Shade",
      value: theme.primaryShade,
      handler: updatePrimaryShade,
    },
    {
      label: "Accent Color",
      value: theme.accentColor,
      handler: updateAccentColor,
    },
    {
      label: "Error Color",
      value: theme.errorColor,
      handler: updateErrorColor,
    },
    {
      label: "Success Color",
      value: theme.successColor,
      handler: updateSuccessColor,
    },
    {
      label: "Warning Color",
      value: theme.warningColor,
      handler: updateWarningColor,
    },
    { label: "Info Color", value: theme.infoColor, handler: updateInfoColor },
  ];

  return (
    <Dialog
      open={themeOpen}
      onOpenChange={setThemeOpen}
      scale="xl"
      scrollable={true}
      scrollDirection="vertical"
      scrollVariant="gradient"
      resizable={true}
    >
      <DialogTrigger asChild>Open Theme Customizer </DialogTrigger>

      <DialogHeader>
        <DialogTitle>Theme Customization</DialogTitle>
        <DialogDescription>
          Customize the theme colors to match your brand or personal style.
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-6">
          {/* === Color Pickers === */}
          {themeColorOptions.map(({ label, value, handler }) => (
            <div key={label} className="grid grid-cols-3 items-center gap-4">
              <Label scale="sm">{label}</Label>
              <Input
                type="color"
                value={typeof handler === "string" ? handler : ""}
                onChange={(e) => handler(e.target.value)}
                style={{
                  backgroundColor: value,
                  borderColor: theme.secondaryColor,
                }}
              />
              <Label scale="sm">{value}</Label>
            </div>
          ))}
          {/* === Gradient Picker === */}
          <div className="grid grid-cols-3 items-start gap-4">
            <Label scale="sm">Primary Gradient</Label>
            <div className="col-span-2">
              <GradientPicker
                label=""
                value={theme.primaryGradient}
                onChange={updatePrimaryGradient}
              />
            </div>
          </div>

          {/* === Note Section === */}
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Changes will apply instantly. Click “Save”
              to persist or “Reset” to revert to default.
            </p>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <div className="flex justify-end space-x-3">
          <Button onClick={resetToDefault} variant="default">
            Reset to Default
          </Button>
          <Button
            onClick={() => setThemeOpen(false)}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            Save & Close
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
