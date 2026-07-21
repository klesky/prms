import { screen } from "@testing-library/react";
import { UsageLogsService } from "open-api";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import MembershipLevelReport from "./MembershipLevelReport";

// jsdom has no real <canvas>; assert on the data Chart.js would have received instead
// of rendering an actual chart.
jest.mock("react-chartjs-2", () => ({
  Bar: ({ data }: { data: { labels: string[]; datasets: { label: string; data: number[] }[] } }) => (
    <div data-testid="bar-chart">{JSON.stringify(data)}</div>
  ),
}));

jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    UsageLogsService: { getUsageReportByMembershipLevel: jest.fn() },
  };
});

const mockedUsageLogsService = UsageLogsService as jest.Mocked<typeof UsageLogsService>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MembershipLevelReport", () => {
  it("shows an error alert when the report fails to load", async () => {
    mockedUsageLogsService.getUsageReportByMembershipLevel.mockRejectedValue(new Error("500"));

    renderWithProviders(<MembershipLevelReport />);

    expect(await screen.findByText("Failed to load membership level report")).toBeInTheDocument();
  });

  it("charts passenger count and usage count per membership level, in tier order", async () => {
    mockedUsageLogsService.getUsageReportByMembershipLevel.mockResolvedValue([
      { membershipLevel: "GOLD", passengerCount: 1, usageCount: 4 },
      { membershipLevel: "SILVER", passengerCount: 2, usageCount: 6 },
      { membershipLevel: "PLATINUM", passengerCount: 1, usageCount: 2 },
    ]);

    renderWithProviders(<MembershipLevelReport />);

    const chart = await screen.findByTestId("bar-chart");
    const data = JSON.parse(chart.textContent!);

    expect(data.labels).toEqual(["SILVER", "GOLD", "PLATINUM"]);
    expect(data.datasets[0].label).toBe("Passengers");
    expect(data.datasets[0].data).toEqual([2, 1, 1]);
    expect(data.datasets[1].label).toBe("Total Uses");
    expect(data.datasets[1].data).toEqual([6, 4, 2]);
  });

  it("zero-fills a membership level missing from the backend response", async () => {
    // The backend always returns all 3 levels, but the UI shouldn't break if one is absent.
    mockedUsageLogsService.getUsageReportByMembershipLevel.mockResolvedValue([
      { membershipLevel: "SILVER", passengerCount: 3, usageCount: 5 },
    ]);

    renderWithProviders(<MembershipLevelReport />);

    const chart = await screen.findByTestId("bar-chart");
    const data = JSON.parse(chart.textContent!);

    expect(data.datasets[0].data).toEqual([3, 0, 0]);
    expect(data.datasets[1].data).toEqual([5, 0, 0]);
  });
});
