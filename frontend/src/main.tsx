import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import { ApiError, OpenAPI } from "./client";
import { CustomProvider } from "./components/ui/provider";
import { routeTree } from "./routeTree.gen";
import "./index.css"; // Tailwind build ends up AFTER Chakra styles

OpenAPI.BASE = import.meta.env.VITE_API_URL;
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || "";
};

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleApiError }),
  mutationCache: new MutationCache({ onError: handleApiError }),
});

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 👇 make Chakra prepend its <style> blocks to <head>
const emotionCache = createCache({ key: "chakra", prepend: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <CustomProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </CustomProvider>
    </CacheProvider>
  </StrictMode>
);
