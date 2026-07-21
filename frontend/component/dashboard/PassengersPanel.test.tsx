import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PassengersService } from "open-api";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import PassengersPanel from "./PassengersPanel";

jest.mock("open-api", () => {
  const actual = jest.requireActual("open-api");
  return {
    ...actual,
    PassengersService: {
      listPassengers: jest.fn(),
      registerPassenger: jest.fn(),
      changeMembershipLevel: jest.fn(),
    },
  };
});

const mockedPassengersService = PassengersService as jest.Mocked<typeof PassengersService>;

const passengers = [
  { username: "zc90663", name: "Ze Yen Chai", membershipLevel: "PLATINUM" as const },
  { username: "bn89820", name: "Naavin Balayah", membershipLevel: "SILVER" as const },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PassengersPanel", () => {
  it("renders the passenger table sorted by username ascending", async () => {
    mockedPassengersService.listPassengers.mockResolvedValue(passengers);

    renderWithProviders(<PassengersPanel />);

    await screen.findByText("bn89820");
    const rows = screen.getAllByRole("row");
    // rows[0] is the header row.
    expect(within(rows[1]).getByText("bn89820")).toBeInTheDocument();
    expect(within(rows[2]).getByText("zc90663")).toBeInTheDocument();
  });

  it("shows an error alert when the passenger list fails to load", async () => {
    mockedPassengersService.listPassengers.mockRejectedValue(new Error("network down"));

    renderWithProviders(<PassengersPanel />);

    expect(await screen.findByText("Failed to load passengers")).toBeInTheDocument();
  });

  it("registers a new passenger through the modal", async () => {
    const user = userEvent.setup();
    mockedPassengersService.listPassengers.mockResolvedValue(passengers);
    mockedPassengersService.registerPassenger.mockResolvedValue({
      username: "mp89242",
      name: "Paul Singaraj Melvin Raj",
      membershipLevel: "GOLD",
    });

    renderWithProviders(<PassengersPanel />);
    await screen.findByText("bn89820");

    await user.click(screen.getByRole("button", { name: /add passenger/i }));
    const modal = await screen.findByRole("dialog");
    await user.type(within(modal).getByLabelText(/username/i), "mp89242");
    await user.type(within(modal).getByLabelText(/^name$/i), "Paul Singaraj Melvin Raj");
    await user.click(within(modal).getByRole("button", { name: /^ok$/i }));

    await waitFor(() =>
      expect(mockedPassengersService.registerPassenger).toHaveBeenCalledWith({
        requestBody: {
          username: "mp89242",
          name: "Paul Singaraj Melvin Raj",
          membershipLevel: "SILVER",
        },
      })
    );
  });

  it("opens the membership-level modal via the row's edit icon, pre-filled with the current level", async () => {
    const user = userEvent.setup();
    mockedPassengersService.listPassengers.mockResolvedValue(passengers);
    mockedPassengersService.changeMembershipLevel.mockResolvedValue({
      username: "bn89820",
      name: "Naavin Balayah",
      membershipLevel: "GOLD",
    });

    renderWithProviders(<PassengersPanel />);
    await screen.findByText("bn89820");
    const rows = screen.getAllByRole("row");

    await user.click(within(rows[1]).getByRole("button"));

    const modal = await screen.findByRole("dialog");
    expect(within(modal).getByText(/change membership level/i)).toBeInTheDocument();
    expect(within(modal).getByText("SILVER")).toBeInTheDocument();
  });

  it("submits the new membership level for the passenger being edited", async () => {
    const user = userEvent.setup();
    mockedPassengersService.listPassengers.mockResolvedValue(passengers);
    mockedPassengersService.changeMembershipLevel.mockResolvedValue({
      username: "bn89820",
      name: "Naavin Balayah",
      membershipLevel: "GOLD",
    });

    renderWithProviders(<PassengersPanel />);
    await screen.findByText("bn89820");
    const rows = screen.getAllByRole("row");
    await user.click(within(rows[1]).getByRole("button"));

    const modal = await screen.findByRole("dialog");
    await user.click(within(modal).getByText("SILVER"));
    await user.click(await screen.findByText("GOLD", { selector: ".ant-select-item-option-content" }));
    await user.click(within(modal).getByRole("button", { name: /^ok$/i }));

    await waitFor(() =>
      expect(mockedPassengersService.changeMembershipLevel).toHaveBeenCalledWith({
        username: "bn89820",
        requestBody: "GOLD",
      })
    );
  });
});
