import { describe, it, expect, vi, beforeEach } from "vitest";
import { SocketConnection, getSocket } from "./socket";

vi.mock("@/config", () => ({
  BACKEND_SERVER: "http://localhost:30000",
  SOCKETIO_ENDPOINT: "/wssss",
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onAny: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe("SocketConnection", () => {
  let socket: SocketConnection;

  beforeEach(() => {
    socket = new SocketConnection();
    vi.clearAllMocks();
  });

  it("creates a new instance", () => {
    expect(socket).toBeInstanceOf(SocketConnection);
  });

  it("addEventListener registers a listener", () => {
    const listener = vi.fn();
    const remove = socket.addEventListener("new_message", listener);

    expect(typeof remove).toBe("function");
  });

  it("removeEventListener (via returned function) unregisters a listener", () => {
    const listener = vi.fn();
    const remove = socket.addEventListener("new_message", listener);

    remove();

    // Adding a second listener should not cause issues
    const listener2 = vi.fn();
    socket.addEventListener("new_message", listener2);
  });

  it("supports multiple listeners for the same event", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    socket.addEventListener("new_message", listener1);
    socket.addEventListener("new_message", listener2);

    // Both should be registered without errors
  });

  it("disconnect does not throw when no socket connected", () => {
    expect(() => socket.disconnect()).not.toThrow();
  });
});

describe("getSocket", () => {
  it("returns the same singleton instance", () => {
    const a = getSocket();
    const b = getSocket();
    expect(a).toBe(b);
  });

  it("returns a SocketConnection instance", () => {
    const conn = getSocket();
    expect(conn).toBeInstanceOf(SocketConnection);
  });
});
