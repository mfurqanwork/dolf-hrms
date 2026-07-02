import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App.tsx"
import "./i18n"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const theme = localStorage.getItem("hrms-theme")
if (theme === "dark") {
  document.documentElement.classList.add("dark")
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <App />
          <Toaster richColors position="top-center" />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)
