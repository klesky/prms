import { ApiError } from "open-api";
import { getApiErrorMessage } from "./apiError";

const buildApiError = (body: unknown, fallbackMessage = "Generic Error") =>
  new ApiError(
    { method: "POST", url: "/api/crew-leads" },
    { url: "/api/crew-leads", ok: false, status: 409, statusText: "Conflict", body },
    fallbackMessage
  );

describe("getApiErrorMessage", () => {
  it("prefers the backend's message field when present", () => {
    const err = buildApiError({ message: "Cannot register another crew lead: the ship allows exactly 3 crew leads" });
    expect(getApiErrorMessage(err)).toBe(
      "Cannot register another crew lead: the ship allows exactly 3 crew leads"
    );
  });

  it("falls back to the ApiError's own message when the body has no message field", () => {
    const err = buildApiError({ error: "Forbidden" }, "Generic Error");
    expect(getApiErrorMessage(err)).toBe("Generic Error");
  });

  it("falls back to the ApiError's own message when the body is undefined", () => {
    const err = buildApiError(undefined, "Generic Error");
    expect(getApiErrorMessage(err)).toBe("Generic Error");
  });

  it("uses a plain Error's message when it isn't an ApiError", () => {
    expect(getApiErrorMessage(new Error("Network request failed"))).toBe("Network request failed");
  });

  it("falls back to a generic message for non-Error values", () => {
    expect(getApiErrorMessage("just a string")).toBe("Something went wrong");
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong");
  });
});
