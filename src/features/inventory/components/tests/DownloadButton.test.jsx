import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import DownloadButton from "../DownloadButton.jsx";
import { isSheetComplete } from "../../utils/sheetUtils.js";
import { downloadSheetPdf } from "../../utils/pdf.js";

// mock external utilities
vi.mock("../../utils/sheetUtils.js", () => ({
  isSheetComplete: vi.fn(),
}));

vi.mock("../../utils/pdf.js", () => ({
  downloadSheetPdf: vi.fn(),
}));

describe("DownloadButton Component", () => {
  let mockSheet;
  let mockOnComplete;

  beforeEach(() => {
    mockSheet = { id: 1, rows: [] };
    mockOnComplete = vi.fn();

    vi.clearAllMocks();
  });

  it("renders the download button with default text", () => {
    isSheetComplete.mockReturnValue(true);

    render(<DownloadButton sheet={mockSheet} />);

    expect(
      screen.getByRole("button", { name: /download pdf/i })
    ).toBeInTheDocument();
  });

  it("applies custom className correctly", () => {
    isSheetComplete.mockReturnValue(true);

    render(<DownloadButton sheet={mockSheet} className="custom-class" />);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("disables the button when no sheet is provided", () => {
    render(<DownloadButton sheet={null} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "No inventory sheet to download");
  });

  it("disables the button when sheet is incomplete", () => {
    isSheetComplete.mockReturnValue(false);

    render(<DownloadButton sheet={mockSheet} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      "title",
      "Complete all fields to enable the download"
    );
  });

  it("disables while downloading", async () => {
    isSheetComplete.mockReturnValue(true);
    downloadSheetPdf.mockResolvedValueOnce();

    render(<DownloadButton sheet={mockSheet} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("calls downloadSheetPdf with the resolved sheet", async () => {
    isSheetComplete.mockReturnValue(true);
    downloadSheetPdf.mockResolvedValueOnce();

    render(
      <DownloadButton sheet={mockSheet} onDownloadComplete={mockOnComplete} />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() =>
      expect(downloadSheetPdf).toHaveBeenCalledWith(mockSheet)
    );
  });

  it("calls onDownloadComplete after downloading", async () => {
    isSheetComplete.mockReturnValue(true);
    downloadSheetPdf.mockResolvedValueOnce();

    render(
      <DownloadButton sheet={mockSheet} onDownloadComplete={mockOnComplete} />
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("handles errors without crashing", async () => {
    isSheetComplete.mockReturnValue(true);
    const error = new Error("PDF failed");
    downloadSheetPdf.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<DownloadButton sheet={mockSheet} />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(downloadSheetPdf).toHaveBeenCalledTimes(1);
    });

    consoleSpy.mockRestore();
  });

  it("shows Loader2 icon when downloading", async () => {
    isSheetComplete.mockReturnValue(true);
    downloadSheetPdf.mockResolvedValueOnce();

    render(<DownloadButton sheet={mockSheet} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);

    // wait for loader to show
    await waitFor(() => {
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    // wait for it to disappear after download resolves
    await waitFor(() => {
      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
    });
  });
});
