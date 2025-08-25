import ThemeProvider from "./app/providers/ThemeProvider";
import AuthProvider from "./app/providers/AuthProvider";
import QueryProvider from "./app/providers/QueryProvider";
import AppRouter from "./app/AppRouter";
import { Suspense } from "react";
import "./index.css";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <AppRouter />
          </Suspense>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
