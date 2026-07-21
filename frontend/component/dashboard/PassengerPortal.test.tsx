import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { PassengersService, ResourcesService, UsageLogsService } from "open-api";
import { renderWithProviders, mockSession } from "../../test-utils/renderWithProviders";
import PassengerPortal from "./PassengerPortal";

jest.mock("next-auth/react", () => ({ useSession: jest.fn() }));
jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    ResourcesService: { listResources: jest.fn() },
    PassengersService: { getAccessibleResources: jest.fn() },
    UsageLogsService: { getMyUsageHistory: jest.fn(), recordUsage: jest.fn() },
  };
});

const mockedUseSession = useSession as jest.Mock;
const mockedResourcesService = ResourcesService as jest.Mocked<typeof ResourcesService>;
const mockedPassengersService = PassengersService as jest.Mocked<typeof PassengersService>;
const mockedUsageLogsService = UsageLogsService as jest.Mocked<typeof UsageLogsService>;

const allResources = [
  { id: "res-1", name: "Sleeping Pod", minRequiredLevel: "SILVER" as const },
  { id: "res-2", name: "Luxury Oxygen Pod", minRequiredLevel: "PLATINUM" as const },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseSession.mockReturnValue(
    mockSession({ username: "mp89242", name: "Paul Singaraj Melvin Raj", membershipLevel: "GOLD" })
  );
  mockedResourcesService.listResources.mockResolvedValue(allResources);
  mockedPassengersService.getAccessibleResources.mockResolvedValue([allResources[0]]);
  mockedUsageLogsService.getMyUsageHistory.mockResolvedValue([]);
});

describe("PassengerPortal", () => {
  it("shows Use Now for accessible resources and a locked banner for the rest", async () => {
    renderWithProviders(<PassengerPortal />);

    expect(await screen.findByText("Sleeping Pod")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /use now/i })).toBeInTheDocument();
    expect(screen.getByText(/requires PLATINUM/i)).toBeInTheDocument();
  });

  it("shows the empty state when there's no usage history", async () => {
    renderWithProviders(<PassengerPortal />);

    expect(await screen.findByText("No resources used yet.")).toBeInTheDocument();
  });

  it("renders persisted usage history from the backend, newest first as returned", async () => {
    mockedUsageLogsService.getMyUsageHistory.mockResolvedValue([
      { id: "log-2", resourceId: "res-1", resourceName: "Sleeping Pod", occurredAt: "2026-07-20T10:00:00Z" },
      { id: "log-1", resourceId: "res-1", resourceName: "Sleeping Pod", occurredAt: "2026-07-19T10:00:00Z" },
    ]);

    renderWithProviders(<PassengerPortal />);

    expect(await screen.findByText("Used 2 times")).toBeInTheDocument();
  });

  it("records usage when Use Now is clicked and refreshes history", async () => {
    const user = userEvent.setup();
    mockedUsageLogsService.recordUsage.mockResolvedValue({
      id: "log-1",
      resourceId: "res-1",
      resourceName: "Sleeping Pod",
      occurredAt: "2026-07-21T10:00:00Z",
    });

    renderWithProviders(<PassengerPortal />);
    await screen.findByText("Sleeping Pod");

    await user.click(screen.getByRole("button", { name: /use now/i }));

    await waitFor(() =>
      expect(mockedUsageLogsService.recordUsage).toHaveBeenCalledWith({ requestBody: "res-1" })
    );
    await waitFor(() => expect(mockedUsageLogsService.getMyUsageHistory).toHaveBeenCalledTimes(2));
  });
});
