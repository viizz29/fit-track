import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocalStorageProvider, useStorage } from "./local-storage-provider";

function TestConsumer() {
  const { get, set, remove, clear } = useStorage();
  return (
    <div>
      <span data-testid="value">{String(get("testKey", "default"))}</span>
      <button onClick={() => set("testKey", "newValue")}>Set</button>
      <button onClick={() => remove("testKey")}>Remove</button>
      <button onClick={() => clear()}>Clear</button>
    </div>
  );
}

describe("LocalStorageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders children after loading", async () => {
    render(
      <LocalStorageProvider>
        <div data-testid="child">Content</div>
      </LocalStorageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  it("provides get, set, remove, clear via context", async () => {
    render(
      <LocalStorageProvider>
        <TestConsumer />
      </LocalStorageProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("value")).toBeInTheDocument();
    });

    expect(screen.getByTestId("value")).toHaveTextContent("default");
    expect(screen.getByText("Set")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("useStorage throws outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    function BadConsumer() {
      useStorage();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      "useStorage must be used within LocalStorageProvider"
    );

    consoleSpy.mockRestore();
  });
});
