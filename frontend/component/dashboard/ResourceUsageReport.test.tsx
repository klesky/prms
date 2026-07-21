import { screen } from "@testing-library/react";
import { UsageLogsService } from "open-api";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import ResourceUsageReport from "./ResourceUsageReport";

jest.mock("react-chartjs-2", () => ({
  Bar: ({ data }: { data: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] } }) => (
    <div data-testid="bar-chart">{JSON.stringify(data)}</div>
  ),
}));

jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    UsageLogsService: { getResourceUsageAnalytics: jest.fn() },
  };
});

const mockedUsageLogsService = UsageLogsService as jest.Mocked<typeof UsageLogsService>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResourceUsageReport", () => {
  it("shows an error alert when the report fails to load", async () => {
    mockedUsageLogsService.getResourceUsageAnalytics.mockRejectedValue(new Error("500"));

    renderWithProviders(<ResourceUsageReport />);

    expect(await screen.findByText("Failed to load resource usage analytics")).toBeInTheDocument();
  });

  it("shows an empty state when no resources have been used", async () => {
    mockedUsageLogsService.getResourceUsageAnalytics.mockResolvedValue([]);

    renderWithProviders(<ResourceUsageReport />);

    expect(await screen.findByText("No resources have been used yet.")).toBeInTheDocument();
  });

  it("charts resources by usage count and highlights the top-ranked one", async () => {
    mockedUsageLogsService.getResourceUsageAnalytics.mockResolvedValue([
      { resourceId: "res-2", resourceName: "Luxury Oxygen Pod", usageCount: 5 },
      { resourceId: "res-1", resourceName: "Food Station", usageCount: 2 },
    ]);

    renderWithProviders(<ResourceUsageReport />);

    const chart = await screen.findByTestId("bar-chart");
    const data = JSON.parse(chart.textContent!);

    expect(data.labels).toEqual(["Luxury Oxygen Pod", "Food Station"]);
    expect(data.datasets[0].data).toEqual([5, 2]);
    // Highest-demand resource (index 0, already sorted by the backend) is highlighted.
    expect(data.datasets[0].backgroundColor[0]).toBe("#fa8c16");
    expect(data.datasets[0].backgroundColor[1]).toBe("#1677ff");
  });
});
