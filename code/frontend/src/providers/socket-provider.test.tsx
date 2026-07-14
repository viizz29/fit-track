import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocketProvider, useSocket } from "./socket-provider";

vi.mock("@/services/socket", () => ({
  getSocket: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock("@/context/use-auth", () => ({
  useAuth: () => ({
    isAuthReady: true,
    token: "test-token",
    user: { id: 1 },
    isAuthenticated: true,
  }),
}));

vi.mock("@/config", () => ({
  SOCKETIO_ENABLED: true,
}));

function SocketConsumer() {
  const socket = useSocket();
  return (
    <div data-testid="socket">
      {socket ? "socket-available" : "no-socket"}
    </div>
  );
}

describe("SocketProvider", () => {
  it("provides socket connection via context", () => {
    render(
      <SocketProvider>
        <SocketConsumer />
      </SocketProvider>
    );

    expect(screen.getByTestId("socket")).toHaveTextContent("socket-available");
  });

  it("renders children", () => {
    render(
      <SocketProvider>
        <div data-testid="child">Content</div>
      </SocketProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("useSocket returns null outside provider", () => {
    function BadConsumer() {
      const socket = useSocket();
      return <span>{socket ? "has" : "null"}</span>;
    }

    render(<BadConsumer />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });
});
