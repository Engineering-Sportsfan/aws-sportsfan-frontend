import { render, screen, fireEvent } from "@testing-library/react";
import LeftSidebar from "./Leftsidebar";

describe("LeftSidebar Component", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render LeftSidebar without crashing", () => {
      render(<LeftSidebar />);
      expect(screen.getByText(/Zone A — Controls/)).toBeInTheDocument();
    });

    it("should display all section titles", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("Zone A — Controls")).toBeInTheDocument();
      expect(screen.getByText("Room Actions")).toBeInTheDocument();
      expect(screen.getByText(/Revenue/)).toBeInTheDocument();
      expect(screen.getByText("Mod Alerts")).toBeInTheDocument();
    });
  });

  // -------- ZONE A — CONTROLS --------
  describe("Zone A - Controls Section", () => {
    it("should render all control buttons", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("Control Panel")).toBeInTheDocument();
      expect(screen.getByText("Leaderboard")).toBeInTheDocument();
      expect(screen.getByText("Live Analytics")).toBeInTheDocument();
      expect(screen.getByText("Content Bank")).toBeInTheDocument();
    });

    it("Control Panel button should be highlighted", () => {
      const { container } = render(<LeftSidebar />);
      const controlPanelBtn = screen.getByText("Control Panel").closest("button");
      expect(controlPanelBtn).toHaveClass("bg-[#f97316]");
    });

    it("other control buttons should have default styling", () => {
      const { container } = render(<LeftSidebar />);
      const leaderboardBtn = screen.getByText("Leaderboard").closest("button");
      expect(leaderboardBtn).toHaveClass("bg-[#1e2128]");
      expect(leaderboardBtn).toHaveClass("border");
    });

    it("buttons should have hover effects", () => {
      const { container } = render(<LeftSidebar />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/hover:/);
      });
    });
  });

  // -------- ROOM ACTIONS --------
  describe("Room Actions Section", () => {
    it("should render all room action buttons", () => {
      render(<LeftSidebar />);
      expect(screen.getByText(/Pause Room/)).toBeInTheDocument();
      expect(screen.getByText("Pause Interactions")).toBeInTheDocument();
      expect(screen.getByText("Pause Live Chat")).toBeInTheDocument();
    });

    it("Pause Room button should be purple", () => {
      const { container } = render(<LeftSidebar />);
      const pauseRoomBtn = screen
        .getByText(/Pause Room/)
        .closest("button");
      expect(pauseRoomBtn).toHaveClass("bg-[#7c3aed]");
    });

    it("Pause Interactions button should be blue", () => {
      const { container } = render(<LeftSidebar />);
      const pauseInteractionBtn = screen
        .getByText("Pause Interactions")
        .closest("button");
      expect(pauseInteractionBtn).toHaveClass("bg-[#1e4080]");
    });

    it("Pause Live Chat button should be orange/yellow", () => {
      const { container } = render(<LeftSidebar />);
      const pauseChatBtn = screen.getByText("Pause Live Chat").closest("button");
      expect(pauseChatBtn).toHaveClass("bg-[#92400e]");
    });

    it("Pause Room button should have pause icon", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("⏸")).toBeInTheDocument();
    });
  });

  // -------- REVENUE SECTION --------
  describe("Revenue Section", () => {
    it("should display revenue title", () => {
      render(<LeftSidebar />);
      const revenueLabel = screen.getByText(/Revenue/);
      expect(revenueLabel).toBeInTheDocument();
    });

    it("should display revenue amount", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("₹42K")).toBeInTheDocument();
    });

    it("should display engagement percentage", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("74%")).toBeInTheDocument();
    });

    it("should display 'Engaged' label", () => {
      render(<LeftSidebar />);
      const engagedLabel = screen.getByText("Engaged");
      expect(engagedLabel).toBeInTheDocument();
    });

    it("revenue values should be green", () => {
      const { container } = render(<LeftSidebar />);
      const greenText = container.querySelectorAll(".text-\\[\\#4ade80\\]");
      expect(greenText.length).toBeGreaterThan(0);
    });
  });

  // -------- MOD ALERTS --------
  describe("Mod Alerts Section", () => {
    it("should display Mod Alerts section", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("Mod Alerts")).toBeInTheDocument();
    });

    it("should display pending alerts", () => {
      render(<LeftSidebar />);
      expect(screen.getByText(/1 pending/)).toBeInTheDocument();
    });

    it("Mod Alerts button should be red", () => {
      const { container } = render(<LeftSidebar />);
      const modAlertBtn = screen.getByText(/1 pending/).closest("button");
      expect(modAlertBtn).toHaveClass("bg-[#450a0a]");
    });

    it("should display warning icon", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("⚠")).toBeInTheDocument();
    });
  });

  // -------- STYLING --------
  describe("Styling & CSS", () => {
    it("should have correct sidebar width", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-[130px]");
    });

    it("should have dark background", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("bg-[#111318]");
    });

    it("should have border on right", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("border-r");
    });

    it("should use flex column layout", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("flex");
      expect(aside).toHaveClass("flex-col");
    });

    it("should have min-h-screen class", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("min-h-screen");
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have sections organized vertically", () => {
      const { container } = render(<LeftSidebar />);
      const sections = container.querySelectorAll(".flex.flex-col");
      expect(sections.length).toBeGreaterThan(3);
    });

    it("should have proper spacing between sections", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("gap-5");
    });

    it("sections should have gap-2 between items", () => {
      const { container } = render(<LeftSidebar />);
      const innerSections = container.querySelectorAll(".gap-2");
      expect(innerSections.length).toBeGreaterThan(0);
    });
  });

  // -------- BUTTONS INTERACTIVITY --------
  describe("Buttons Interactivity", () => {
    it("buttons should be clickable", () => {
      const { container } = render(<LeftSidebar />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn).not.toBeDisabled();
      });
    });

    it("should have transition effects on hover", () => {
      const { container } = render(<LeftSidebar />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/transition/);
      });
    });
  });

  // -------- TYPOGRAPHY --------
  describe("Typography", () => {
    it("section labels should be small and uppercase", () => {
      const { container } = render(<LeftSidebar />);
      const labels = container.querySelectorAll(".text-\\[9px\\]");
      expect(labels.length).toBeGreaterThan(0);
    });

    it("should use proper font weights", () => {
      const { container } = render(<LeftSidebar />);
      const boldText = container.querySelectorAll(".font-bold");
      expect(boldText.length).toBeGreaterThan(0);
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should render semantic aside element", () => {
      const { container } = render(<LeftSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toBeInTheDocument();
    });

    it("buttons should have meaningful labels", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("Control Panel")).toBeInTheDocument();
      expect(screen.getByText("Leaderboard")).toBeInTheDocument();
      expect(screen.getByText("Live Analytics")).toBeInTheDocument();
    });

    it("should display all text content clearly", () => {
      render(<LeftSidebar />);
      expect(screen.getByText("₹42K")).toBeInTheDocument();
      expect(screen.getByText("74%")).toBeInTheDocument();
    });
  });
});
