import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchWidget from "./search-widget";

describe("SearchWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders input field", () => {
    render(<SearchWidget onInput={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search images...")).toBeInTheDocument();
  });

  it("calls onInput with null when input is empty", () => {
    const onInput = vi.fn();
    render(<SearchWidget onInput={onInput} />);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onInput).toHaveBeenCalledWith(null);
  });

  it("debounces input and calls onInput after delay", () => {
    const onInput = vi.fn();
    render(<SearchWidget onInput={onInput} />);

    const input = screen.getByPlaceholderText("Search images...");

    act(() => {
      fireEvent.change(input, { target: { value: "test" } });
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onInput).toHaveBeenCalledWith("test");
  });
});
