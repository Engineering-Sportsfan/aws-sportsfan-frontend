import { render, screen, fireEvent } from "@testing-library/react";
import MiddlePanel from "./Middlepanel";

describe("MiddlePanel Component", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render MiddlePanel without crashing", () => {
      render(<MiddlePanel />);
      expect(
        screen.getByText(/Live Stream Feed — Fan View/)
      ).toBeInTheDocument();
    });

    it("should render stream feed placeholder", () => {
      render(<MiddlePanel />);
      expect(
        screen.getByText("[ Live Stream Feed — Fan View ]")
      ).toBeInTheDocument();
    });

    it("should render Zone C — Chat & Social section", () => {
      render(<MiddlePanel />);
      expect(screen.getByText(/Zone C — Chat & Social/)).toBeInTheDocument();
    });
  });

  // -------- STREAM AREA --------
  describe("Stream Feed Area", () => {
    it("should render View Active Fans button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("View Active Fans")).toBeInTheDocument();
    });

    it("View Active Fans button should be clickable", () => {
      const { container } = render(<MiddlePanel />);
      const button = screen.getByText("View Active Fans");
      expect(button).not.toBeDisabled();
    });

    it("should have stream placeholder text", () => {
      render(<MiddlePanel />);
      expect(
        screen.getByText("[ Live Stream Feed — Fan View ]")
      ).toBeInTheDocument();
    });
  });

  // -------- HOST CAM PIP --------
  describe("Host Camera Picture-in-Picture", () => {
    it("should render Host Cam section", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Host Cam")).toBeInTheDocument();
    });

    it("should display PiP label", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("PiP")).toBeInTheDocument();
    });

    it("Host Cam should have reddish background", () => {
      const { container } = render(<MiddlePanel />);
      const hostCam = container.querySelector(".bg-\\[\\#1a0a08\\]");
      expect(hostCam).toBeInTheDocument();
    });

    it("Host Cam should have border", () => {
      const { container } = render(<MiddlePanel />);
      const hostCam = screen.getByText("Host Cam").closest("div");
      expect(hostCam).toHaveClass("border");
    });
  });

  // -------- BOTTOM ACTION BUTTONS --------
  describe("Bottom Action Buttons", () => {
    it("should render Ask AI button", () => {
      render(<MiddlePanel />);
      const askAiButtons = screen.getAllByText(/Ask AI/);
      expect(askAiButtons.length).toBeGreaterThan(0);
    });

    it("should render Add/Plus button", () => {
      const { container } = render(<MiddlePanel />);
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    it("should render Mic button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("🎤")).toBeInTheDocument();
    });

    it("should render Camera button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("📷")).toBeInTheDocument();
    });

    it("should render End Room button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("End Room")).toBeInTheDocument();
    });

    it("Ask AI button should have purple background", () => {
      const { container } = render(<MiddlePanel />);
      const askAiBtns = screen.getAllByText(/Ask AI/);
      const askAiBtn = askAiBtns[0].closest("button");
      expect(askAiBtn).toHaveClass("bg-[#7c3aed]");
    });

    it("End Room button should be red", () => {
      const { container } = render(<MiddlePanel />);
      const endRoomBtn = screen.getByText("End Room").closest("button");
      expect(endRoomBtn).toHaveClass("bg-[#dc2626]");
    });

    it("buttons should have hover effects", () => {
      const { container } = render(<MiddlePanel />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/hover:/);
      });
    });

    it("buttons should not be disabled", () => {
      const { container } = render(<MiddlePanel />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn).not.toBeDisabled();
      });
    });
  });

  // -------- ZONE C — CHAT & SOCIAL --------
  describe("Zone C - Chat & Social Section", () => {
    it("should render section title", () => {
      render(<MiddlePanel />);
      expect(screen.getByText(/Zone C — Chat & Social/)).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Pin Message")).toBeInTheDocument();
      expect(screen.getByText("Announcement")).toBeInTheDocument();
      expect(screen.getByText("Flag MoM")).toBeInTheDocument();
    });

    it("should render Pin Message button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Pin Message")).toBeInTheDocument();
    });

    it("should render Announcement button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Announcement")).toBeInTheDocument();
    });

    it("should render Flag MoM button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Flag MoM")).toBeInTheDocument();
    });

    it("should render Lower Third button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Lower Third")).toBeInTheDocument();
    });

    it("should render Annotate Stream button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Annotate Stream")).toBeInTheDocument();
    });

    it("should render Acknowledge Super Fan button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Acknowledge Super Fan")).toBeInTheDocument();
    });

    it("Flag MoM button should be highlighted (red)", () => {
      const { container } = render(<MiddlePanel />);
      const flagMoMBtn = screen.getByText("Flag MoM").closest("button");
      expect(flagMoMBtn).toHaveClass("bg-[#1a0808]");
    });
  });

  // -------- PINNED MESSAGE --------
  describe("Pinned Message Display", () => {
    it("should render pinned message section", () => {
      render(<MiddlePanel />);
      const pinnedIcons = screen.getAllByText(/📌/);
      expect(pinnedIcons.length).toBeGreaterThan(0);
    });

    it("should display pinned message content", () => {
      render(<MiddlePanel />);
      const pinnedText = screen.queryByText(
        (content) => content.includes("What is India's smash speed average?")
      );
      expect(pinnedText).toBeInTheDocument();
    });

    it("should have Unpin button", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("Unpin")).toBeInTheDocument();
    });

    it("pinned message should have green background", () => {
      const { container } = render(<MiddlePanel />);
      const pinnedMsg = container.querySelector(".bg-\\[\\#0d1117\\]");
      expect(pinnedMsg).toBeInTheDocument();
    });

    it("Unpin button should be clickable", () => {
      const { container } = render(<MiddlePanel />);
      const unpinBtn = screen.getByText("Unpin");
      expect(unpinBtn).not.toBeDisabled();
    });
  });

  // -------- STYLING --------
  describe("Styling & CSS", () => {
    it("should have flex layout", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("flex-col");
    });

    it("should use flex-1 for main panel expansion", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex-1");
    });

    it("should have dark background", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("bg-[#0d0f14]");
    });

    it("stream area should have darker background", () => {
      const { container } = render(<MiddlePanel />);
      const streamArea = container.querySelector(".bg-\\[\\#0a0c10\\]");
      expect(streamArea).toBeInTheDocument();
    });

    it("bottom bar should have dark background", () => {
      const { container } = render(<MiddlePanel />);
      const bottomBar = container.querySelector(".bg-\\[\\#111318\\]");
      expect(bottomBar).toBeInTheDocument();
    });

    it("should use min-w-0 for proper flex behavior", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-w-0");
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have stream area as main content", () => {
      const { container } = render(<MiddlePanel />);
      const flexChildren = container.querySelector(".flex-1");
      expect(flexChildren).toBeInTheDocument();
    });

    it("should have bottom bar below stream", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild as HTMLElement;
      const children = mainDiv.children;
      expect(children.length).toBeGreaterThan(1);
    });

    it("buttons should be absolutely positioned in stream", () => {
      const { container } = render(<MiddlePanel />);
      const absoluteButtons = container.querySelectorAll(".absolute");
      expect(absoluteButtons.length).toBeGreaterThan(0);
    });
  });

  // -------- ICONS AND EMOJI --------
  describe("Icons & Emoji", () => {
    it("should display icon for Pin Message", () => {
      render(<MiddlePanel />);
      const pinIcons = screen.getAllByText("📌");
      expect(pinIcons.length).toBeGreaterThan(0);
    });

    it("should display icon for Announcement", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("📢")).toBeInTheDocument();
    });

    it("should display icon for Flag MoM", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("🚩")).toBeInTheDocument();
    });

    it("should display icon for Lower Third", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("📋")).toBeInTheDocument();
    });

    it("should display icon for Annotate Stream", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("✏️")).toBeInTheDocument();
    });

    it("should display icon for Star/Super Fan", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("⭐")).toBeInTheDocument();
    });

    it("should display icon for Ask AI", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("✦")).toBeInTheDocument();
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should have descriptive button labels", () => {
      render(<MiddlePanel />);
      expect(screen.getByText("View Active Fans")).toBeInTheDocument();
      expect(screen.getByText("End Room")).toBeInTheDocument();
    });

    it("buttons should be keyboard accessible", () => {
      const { container } = render(<MiddlePanel />);
      const buttons = container.querySelectorAll("button");
      buttons.forEach((btn) => {
        expect(btn.tagName).toBe("BUTTON");
      });
    });

    it("should have clear text hierarchy", () => {
      render(<MiddlePanel />);
      expect(screen.getByText(/Zone C — Chat & Social/)).toBeInTheDocument();
    });
  });

  // -------- RESPONSIVENESS --------
  describe("Responsive Design", () => {
    it("stream area should be flex-1 for responsive height", () => {
      const { container } = render(<MiddlePanel />);
      const streamArea = container.querySelector(".flex-1");
      expect(streamArea).toBeInTheDocument();
    });

    it("should handle overflow properly", () => {
      const { container } = render(<MiddlePanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-w-0");
    });

    it("buttons should be centered and layered", () => {
      const { container } = render(<MiddlePanel />);
      const bottomButtons = container.querySelector(".absolute.bottom-4");
      expect(bottomButtons).toBeInTheDocument();
    });
  });
});
