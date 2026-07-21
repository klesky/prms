import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourcesService } from "open-api";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import ShipResourcesPanel from "./ShipResourcesPanel";

jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    ResourcesService: {
      listResources: jest.fn(),
      provisionResource: jest.fn(),
      decommissionResource: jest.fn(),
    },
  };
});

const mockedResourcesService = ResourcesService as jest.Mocked<typeof ResourcesService>;

const resources = [
  { id: "res-1", name: "Sleeping Pod", minRequiredLevel: "SILVER" as const },
  { id: "res-2", name: "Luxury Oxygen Pod", minRequiredLevel: "PLATINUM" as const },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ShipResourcesPanel", () => {
  it("renders the resources table", async () => {
    mockedResourcesService.listResources.mockResolvedValue(resources);

    renderWithProviders(<ShipResourcesPanel />);

    expect(await screen.findByText("Sleeping Pod")).toBeInTheDocument();
    expect(screen.getByText("Luxury Oxygen Pod")).toBeInTheDocument();
    expect(screen.getByText("PLATINUM")).toBeInTheDocument();
  });

  it("shows an error alert when the resource list fails to load", async () => {
    mockedResourcesService.listResources.mockRejectedValue(new Error("network down"));

    renderWithProviders(<ShipResourcesPanel />);

    expect(await screen.findByText("Failed to load resources")).toBeInTheDocument();
  });

  it("provisions a new resource through the modal", async () => {
    const user = userEvent.setup();
    mockedResourcesService.listResources.mockResolvedValue(resources);
    mockedResourcesService.provisionResource.mockResolvedValue({
      id: "res-3",
      name: "Fitness Center",
      minRequiredLevel: "GOLD",
    });

    renderWithProviders(<ShipResourcesPanel />);
    await screen.findByText("Sleeping Pod");

    await user.click(screen.getByRole("button", { name: /add resource/i }));
    const modal = await screen.findByRole("dialog");
    await user.type(within(modal).getByLabelText(/resource name/i), "Fitness Center");
    await user.click(within(modal).getByRole("button", { name: /^ok$/i }));

    await waitFor(() =>
      expect(mockedResourcesService.provisionResource).toHaveBeenCalledWith({
        requestBody: { name: "Fitness Center", minRequiredLevel: "SILVER" },
      })
    );
  });

  it("decommissions a resource after confirming the Popconfirm", async () => {
    const user = userEvent.setup();
    mockedResourcesService.listResources.mockResolvedValue(resources);
    mockedResourcesService.decommissionResource.mockResolvedValue(undefined);

    renderWithProviders(<ShipResourcesPanel />);
    await screen.findByText("Sleeping Pod");

    const [decommissionButton] = screen.getAllByRole("button", { name: /decommission/i });
    await user.click(decommissionButton);

    const confirmButton = await screen.findByRole("button", { name: /^ok$/i });
    await user.click(confirmButton);

    await waitFor(() =>
      expect(mockedResourcesService.decommissionResource).toHaveBeenCalledWith({ resourceId: "res-1" })
    );
  });
});
