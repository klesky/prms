import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

// Light theme matching the PRMS design handoff (primary blue #1677ff).
const theme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#1677ff",
    colorBgLayout: "#f5f6f8",
    borderRadius: 6,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export default theme;
