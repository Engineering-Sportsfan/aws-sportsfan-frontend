import { render, screen } from "@testing-library/react";
import TopHeader from "./Topheader ";

describe("TopHeader Component", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render TopHeader without crashing", () => {
      render(<TopHeader />);
      expect(screen.getByText("LiveRoomControl")).toBeInTheDocument();
    });

    it("should render header with correct title", () => {
      render(<TopHeader />);
      expect(
        screen.getByText("Live Room — Control Panel (Main)")
      ).toBeInTheDocument();
    });

    it("should render Host button", () => {
      render(<TopHeader />);
      expect(screen.getByText("← Host")).toBeInTheDocument();
    });

    it("should render LIVE badge", () => {
      render(<TopHeader />);
      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });
  });

  // -------- STATS DISPLAY --------
  describe("Stats Display", () => {
    it("should display timer", () => {
      render(<TopHeader />);
      expect(screen.getByText(/⏱ 34:52/)).toBeInTheDocument();
    });

    it("should display viewer count", () => {
      render(<TopHeader />);
      expect(screen.getByText("1,204")).toBeInTheDocument();
      expect(screen.getByText("watching")).toBeInTheDocument();
    });

    it("should display active users count", () => {
      render(<TopHeader />);
      expect(screen.getByText("847")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("should display viewer icon", () => {
      render(<TopHeader />);
      expect(screen.getByText("👥")).toBeInTheDocument();
    });
  });

  // -------- STYLING --------
  describe("Styling & CSS", () => {
    it("should have header with correct height", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("h-[52px]");
    });

    it("should have dark background", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-[#0d0f14]");
    });

    it("should have white text", () => {
      const { container } = render(<TopHeader />);
      const textElements = container.querySelectorAll(".text-white");
      expect(textElements.length).toBeGreaterThan(0);
    });

    it("should have border at bottom", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("border-b");
    });

    it("should use flex layout", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("items-center");
      expect(header).toHaveClass("justify-between");
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have three main sections: left, center, right", () => {
      const { container } = render(<TopHeader />);
      const flexDivs = container.querySelectorAll(".flex");
      expect(flexDivs.length).toBeGreaterThan(0);
    });

    it("should have logo and nav on the left", () => {
      render(<TopHeader />);
      expect(screen.getByText("LiveRoomControl")).toBeInTheDocument();
      expect(screen.getByText("← Host")).toBeInTheDocument();
    });

    it("should have LIVE badge in center", () => {
      render(<TopHeader />);
      const liveBadge = screen.getByText("LIVE");
      expect(liveBadge).toBeInTheDocument();
    });

    it("should have stats on the right", () => {
      render(<TopHeader />);
      expect(screen.getByText("1,204")).toBeInTheDocument();
      expect(screen.getByText("847")).toBeInTheDocument();
    });
  });

  // -------- LIVE BADGE --------
  describe("LIVE Badge", () => {
    it("should render LIVE badge with red background", () => {
      const { container } = render(<TopHeader />);
      const badge = container.querySelector(".bg-\\[\\#dc2626\\]");
      expect(badge).toBeInTheDocument();
    });

    it("should have animated pulse indicator", () => {
      const { container } = render(<TopHeader />);
      const pulseIndicator = container.querySelector(".animate-pulse");
      expect(pulseIndicator).toBeInTheDocument();
    });

    it("should have white pulse circle", () => {
      const { container } = render(<TopHeader />);
      const pulseCircle = container.querySelector(".w-1\\.5.h-1\\.5.rounded-full.bg-white");
      expect(pulseCircle).toBeInTheDocument();
    });
  });

  // -------- BUTTONS --------
  describe("Buttons", () => {
    it("should have clickable Host button", () => {
      const { container } = render(<TopHeader />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("Host button should have hover effect", () => {
      const { container } = render(<TopHeader />);
      const hostBtn = screen.getByText("← Host").closest("button");
      expect(hostBtn).toHaveClass("hover:text-white");
    });
  });

  // -------- RESPONSIVE --------
  describe("Responsive Design", () => {
    it("should have flex-shrink-0 class for fixed height", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("flex-shrink-0");
    });

    it("should have px-4 for horizontal padding", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toHaveClass("px-4");
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should render semantic header element", () => {
      const { container } = render(<TopHeader />);
      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have descriptive text labels", () => {
      render(<TopHeader />);
      expect(screen.getByText("watching")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("buttons should have meaningful text content", () => {
      render(<TopHeader />);
      expect(screen.getByText("← Host")).toBeInTheDocument();
      expect(screen.getByText("LIVE")).toBeInTheDocument();
    });
  });

  // -------- TEXT CONTENT --------
  describe("Text Content", () => {
    it("should display all required labels", () => {
      render(<TopHeader />);
      expect(screen.getByText("LiveRoomControl")).toBeInTheDocument();
      expect(screen.getByText(/Live Room/)).toBeInTheDocument();
      expect(screen.getByText("watching")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("should use correct emoji icons", () => {
      render(<TopHeader />);
      expect(screen.getByText("👥")).toBeInTheDocument();
    });
  });
});
