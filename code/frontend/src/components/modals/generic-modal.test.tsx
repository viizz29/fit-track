import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenericModal from "./generic-modal";

describe("GenericModal", () => {
  it("renders with title and children", () => {
    render(
      <GenericModal open={true} title="Test Modal" onClose={vi.fn()}>
        <div>Modal content</div>
      </GenericModal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <GenericModal
        open={true}
        title="Actions"
        onClose={vi.fn()}
        actions={[{ label: "Save", listener: vi.fn() }]}
      >
        <div>content</div>
      </GenericModal>
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls action listener when button is clicked", async () => {
    const listener = vi.fn();
    const user = userEvent.setup();

    render(
      <GenericModal
        open={true}
        onClose={vi.fn()}
        actions={[{ label: "OK", listener }]}
      >
        <div>content</div>
      </GenericModal>
    );

    await user.click(screen.getByText("OK"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("renders cancel button when onCancel is provided", () => {
    render(
      <GenericModal open={true} onClose={vi.fn()} onCancel={vi.fn()}>
        <div>content</div>
      </GenericModal>
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <GenericModal open={true} onClose={vi.fn()} onCancel={onCancel}>
        <div>content</div>
      </GenericModal>
    );

    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    render(
      <GenericModal open={false} title="Hidden" onClose={vi.fn()}>
        <div>content</div>
      </GenericModal>
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
