type RGBColor = {
  r: number;
  g: number;
  b: number;
};

type PercentageRGBColor = {
  percentage: number;
  color: RGBColor;
};

const defaultPercentageColors: PercentageRGBColor[] = [
  { percentage: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
  { percentage: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
  { percentage: 1.0, color: { r: 0x00, g: 0xff, b: 183 } },
];

function getColorForPercentage(
  percentage: number,
  alpha?: number,
  colors: PercentageRGBColor[] = defaultPercentageColors
) {
  let i: number;
  for (i = 1; i < colors.length - 1; i++) {
    if (percentage < colors[i].percentage) {
      break;
    }
  }

  let lower = colors[i - 1];
  let upper = colors[i];
  let range = upper.percentage - lower.percentage;
  let rangePct = (percentage - lower.percentage) / range;
  let pctLower = 1 - rangePct;
  let pctUpper = rangePct;
  let color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };

  let rgb = [color.r, color.g, color.b].join(",");

  if (alpha) {
    return `rgba(${rgb}, ${alpha})`;
  }

  return `rgba(${rgb})`;
}

export { type RGBColor, type PercentageRGBColor, getColorForPercentage };
