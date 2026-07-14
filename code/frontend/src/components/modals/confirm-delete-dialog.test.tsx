import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDeleteDialog from "./confirm-delete-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("ConfirmDeleteDialog", () => {
  it("renders with title and message", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        title="Delete Exercise"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Delete Exercise")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("shows default message from translation when no message prop", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        title="Delete"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("areYouSure")).toBeInTheDocument();
  });

  it("calls onConfirm when delete button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDeleteDialog
        open={true}
        title="Delete"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByText("delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDeleteDialog
        open={true}
        title="Delete"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByText("cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when isPending", () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        title="Delete"
        isPending={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("deleting")).toBeDisabled();
    expect(screen.getByText("cancel")).toBeDisabled();
  });

  it("does not render when open is false", () => {
    render(
      <ConfirmDeleteDialog
        open={false}
        title="Delete"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });
});
