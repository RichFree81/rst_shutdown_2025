/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": "var(--brand-blue)",
        "brand-sky": "var(--brand-sky)",
        "brand-navy": "var(--brand-navy)",
        "brand-grey": "var(--brand-grey)",
        "brand-bluegrey": "var(--brand-bluegrey)",
        "brand-copper": "var(--brand-copper)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-subtle": "var(--border-subtle)",
        "bg-canvas": "var(--bg-canvas)",
        "bg-surface": "var(--bg-surface)"
      },
      fontFamily: {
        ui: ["Montserrat","Arial","Helvetica","sans-serif"],
        body: ["Taviraj","Georgia","Times New Roman","serif"]
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 8px 24px rgba(17,30,54,0.06)" }
    }
  },
  plugins: []
}
