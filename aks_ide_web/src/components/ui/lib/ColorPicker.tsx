import React from "react";

export const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="color-picker">
      <label>
        {label}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-input"
        />
      </label>
      <span className="color-value">{value}</span>
    </div>
  );
};

export const GradientPicker: React.FC<{
  label: string;
  value: string;
  onChange: (gradient: string) => void;
}> = ({ label, value, onChange }) => {
  const colorMatch = value.match(/(#[0-9a-f]{6}|rgba?\(.*?\))/gi) || [
    "#ffffff",
    "#ffffff",
  ];
  const [startColor, endColor] =
    colorMatch.length >= 2 ? colorMatch : [colorMatch[0], colorMatch[0]];

  const handleStartColorChange = (color: string) => {
    onChange(`linear-gradient(90deg, ${color} 0%, ${endColor} 100%)`);
  };

  const handleEndColorChange = (color: string) => {
    onChange(`linear-gradient(90deg, ${startColor} 0%, ${color} 100%)`);
  };

  return (
    <div className="gradient-picker">
      <label>{label}</label>
      <div className="gradient-controls">
        <ColorPicker
          label="Start"
          value={startColor}
          onChange={handleStartColorChange}
        />
        <ColorPicker
          label="End"
          value={endColor}
          onChange={handleEndColorChange}
        />
      </div>
      <div
        className="gradient-preview"
        style={{
          background: value,
          height: "20px",
          borderRadius: "4px",
          marginTop: "8px",
        }}
      />
    </div>
  );
};
