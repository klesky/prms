import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { ApiError, CrewLeadsService } from "open-api";
import { renderWithProviders, mockSession } from "../../test-utils/renderWithProviders";
import CrewLeadsPanel from "./CrewLeadsPanel";

jest.mock("next-auth/react", () => ({ useSession: jest.fn() }));
jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    CrewLeadsService: {
      listCrewLeads: jest.fn(),
      registerCrewLead: jest.fn(),
      deleteCrewLead: jest.fn(),
    },
  };
});

const mockedUseSession = useSession as jest.Mock;
const mockedCrewLeadsService = CrewLeadsService as jest.Mocked<typeof CrewLeadsService>;

const crewLeads = [
  { username: "so90667", name: "Soon Yoong Ooi" },
  { username: "yg91185", name: "Yun Yie Goh" },
  { username: "mh91004", name: "Harris Fadhillah Mu'adzzam Shah" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseSession.mockReturnValue(mockSession({ username: "so90667" }));
});

describe("CrewLeadsPanel", () => {
  it("renders every crew lead as a chip card, without a Remove button on the caller's own card", async () => {
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads);

    renderWithProviders(<CrewLeadsPanel />);

    expect(await screen.findByText("Yun Yie Goh")).toBeInTheDocument();
    expect(screen.getByText("Soon Yoong Ooi")).toBeInTheDocument();
    expect(screen.getByText("Harris Fadhillah Mu'adzzam Shah")).toBeInTheDocument();

    // Own card (so90667) has no Remove button; the other two do.
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(2);
  });

  it("disables Add Crew Lead once 3 crew leads already exist", async () => {
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads);

    renderWithProviders(<CrewLeadsPanel />);

    await screen.findByText("Yun Yie Goh");
    expect(screen.getByRole("button", { name: /add crew lead/i })).toBeDisabled();
  });

  it("enables Add Crew Lead when fewer than 3 crew leads exist", async () => {
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads.slice(0, 2));

    renderWithProviders(<CrewLeadsPanel />);

    await screen.findByText("Yun Yie Goh");
    expect(screen.getByRole("button", { name: /add crew lead/i })).toBeEnabled();
  });

  it("shows an error alert when the crew leads list fails to load", async () => {
    mockedCrewLeadsService.listCrewLeads.mockRejectedValue(new Error("network down"));

    renderWithProviders(<CrewLeadsPanel />);

    expect(await screen.findByText("Failed to load crew leads")).toBeInTheDocument();
  });

  it("registers a new crew lead through the modal and refreshes the list", async () => {
    const user = userEvent.setup();
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads.slice(0, 2));
    mockedCrewLeadsService.registerCrewLead.mockResolvedValue({
      username: "zc90663",
      name: "Ze Yen Chai",
    });

    renderWithProviders(<CrewLeadsPanel />);
    await screen.findByText("Yun Yie Goh");

    await user.click(screen.getByRole("button", { name: /add crew lead/i }));

    const modal = await screen.findByRole("dialog");
    await user.type(within(modal).getByLabelText(/username/i), "zc90663");
    await user.type(within(modal).getByLabelText(/^name$/i), "Ze Yen Chai");
    await user.click(within(modal).getByRole("button", { name: /^ok$/i }));

    await waitFor(() =>
      expect(mockedCrewLeadsService.registerCrewLead).toHaveBeenCalledWith({
        requestBody: { username: "zc90663", name: "Ze Yen Chai" },
      })
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows the backend's enforcement message inline when the crew lead limit is exceeded", async () => {
    const user = userEvent.setup();
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads.slice(0, 2));
    mockedCrewLeadsService.registerCrewLead.mockRejectedValue(
      new ApiError(
        { method: "POST", url: "/api/crew-leads" },
        { url: "/api/crew-leads", ok: false, status: 409, statusText: "Conflict", body: {} },
        "Cannot register another crew lead: the ship allows exactly 3 crew leads"
      )
    );

    renderWithProviders(<CrewLeadsPanel />);
    await screen.findByText("Yun Yie Goh");

    await user.click(screen.getByRole("button", { name: /add crew lead/i }));
    const modal = await screen.findByRole("dialog");
    await user.type(within(modal).getByLabelText(/username/i), "zc90663");
    await user.type(within(modal).getByLabelText(/^name$/i), "Ze Yen Chai");
    await user.click(within(modal).getByRole("button", { name: /^ok$/i }));

    expect(
      await screen.findByText("Cannot register another crew lead: the ship allows exactly 3 crew leads")
    ).toBeInTheDocument();
  });

  it("removes a crew lead after confirming, but never offers to remove the caller themselves", async () => {
    const user = userEvent.setup();
    mockedCrewLeadsService.listCrewLeads.mockResolvedValue(crewLeads);
    mockedCrewLeadsService.deleteCrewLead.mockResolvedValue(undefined);

    renderWithProviders(<CrewLeadsPanel />);
    await screen.findByText("Yun Yie Goh");

    const [removeButton] = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButton);

    const confirmButton = await screen.findByRole("button", { name: /^ok$/i });
    await user.click(confirmButton);

    await waitFor(() =>
      expect(mockedCrewLeadsService.deleteCrewLead).toHaveBeenCalledWith({ username: "yg91185" })
    );
  });
});
