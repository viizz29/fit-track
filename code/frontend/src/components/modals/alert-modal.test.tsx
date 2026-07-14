import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertModal from "./alert-modal";

describe("AlertModal", () => {
  it("renders with title and message", () => {
    render(
      <AlertModal open={true} title="Warning" message="Something happened" onClose={vi.fn()} />
    );

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("uses default title 'Alert' when none provided", () => {
    render(
      <AlertModal open={true} message="Info" onClose={vi.fn()} />
    );

    expect(screen.getByText("Alert")).toBeInTheDocument();
  });

  it("calls onClose when OK button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AlertModal open={true} message="Done" onClose={onClose} />
    );

    await user.click(screen.getByText("OK"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    render(
      <AlertModal open={false} message="Hidden" onClose={vi.fn()} />
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
