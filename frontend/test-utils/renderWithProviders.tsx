import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  );
}

/** Use with `jest.mock("next-auth/react", () => ({ useSession: jest.fn() }))`. */
export const mockSession = (overrides: Record<string, unknown> = {}) => ({
  data: {
    username: "so90667",
    name: "Soon Yoong Ooi",
    roles: ["crew-lead"],
    access_token: "test-token",
    ...overrides,
  },
  status: "authenticated" as const,
});
