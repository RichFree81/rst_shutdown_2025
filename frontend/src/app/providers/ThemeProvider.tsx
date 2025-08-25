import { PropsWithChildren } from "react";
export default function ThemeProvider({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-bg-canvas text-text-primary">{children}</div>;
}
