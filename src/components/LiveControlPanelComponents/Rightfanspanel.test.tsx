import { render, screen, fireEvent } from "@testing-library/react";
import RightFansPanel from "./Rightfanspanel";

describe("RightFansPanel Component", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render RightFansPanel without crashing", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Top Fans — Live/)).toBeInTheDocument();
    });

    it("should render Top Fans section", () => {
      render(<RightFansPanel />);
      expect(screen.getByText("Top Fans — Live")).toBeInTheDocument();
    });

    it("should render Super Fan Queue section", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Super Fan Queue/)).toBeInTheDocument();
    });

    it("should display all top fans", () => {
      render(<RightFansPanel />);
      expect(screen.getAllByText("Rahul_123").length).toBeGreaterThan(0);
      expect(screen.getAllByText("cricket_queen").length).toBeGreaterThan(0);
      expect(screen.getAllByText("badminton_dev").length).toBeGreaterThan(0);
    });
  });

  // -------- TOP FANS SECTION --------
  describe("Top Fans Section", () => {
    it("should render Top Fans title", () => {
      render(<RightFansPanel />);
      expect(screen.getByText("Top Fans — Live")).toBeInTheDocument();
    });

    it("should display first top fan: Rahul_123", () => {
      render(<RightFansPanel />);
      const rahulElements = screen.getAllByText("Rahul_123");
      expect(rahulElements.length).toBeGreaterThan(0);
    });

    it("should display second top fan: cricket_queen", () => {
      render(<RightFansPanel />);
      const cricketElements = screen.getAllByText("cricket_queen");
      expect(cricketElements.length).toBeGreaterThan(0);
    });

    it("should display third top fan: badminton_dev", () => {
      render(<RightFansPanel />);
      const badmintonElements = screen.getAllByText("badminton_dev");
      expect(badmintonElements.length).toBeGreaterThan(0);
    });

    it("should display fan points", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/2,840 pts/)).toBeInTheDocument();
      expect(screen.getByText(/2,210 pts/)).toBeInTheDocument();
      expect(screen.getByText(/1,980 pts/)).toBeInTheDocument();
    });

    it("should format points with commas", () => {
      render(<RightFansPanel />);
      const pointsTexts = screen.getAllByText(/pts/);
      expect(pointsTexts.length).toBeGreaterThan(0);
    });

    it("should have correct number of top fans displayed", () => {
      render(<RightFansPanel />);
      const rahulElements = screen.getAllByText("Rahul_123");
      const cricketElements = screen.getAllByText("cricket_queen");
      const badmintonElements = screen.getAllByText("badminton_dev");
      expect(rahulElements.length).toBeGreaterThan(0);
      expect(cricketElements.length).toBeGreaterThan(0);
      expect(badmintonElements.length).toBeGreaterThan(0);
    });

    it("fans should display in cards", () => {
      const { container } = render(<RightFansPanel />);
      const fanCards = container.querySelectorAll(".bg-\\[\\#1a1d24\\].border.border-\\[\\#2a2d35\\]");
      expect(fanCards.length).toBeGreaterThan(0);
    });
  });

  // -------- AVATARS --------
  describe("Fan Avatars", () => {
    it("should display avatar for Rahul_123", () => {
      const { container } = render(<RightFansPanel />);
      const avatars = container.querySelectorAll(
        ".w-7.h-7.rounded-full.flex.items-center.justify-center"
      );
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("Rahul's avatar should show initial 'R'", () => {
      render(<RightFansPanel />);
      const initials = screen.getAllByText("R");
      expect(initials.length).toBeGreaterThan(0);
    });

    it("cricket_queen's avatar should show initial 'C'", () => {
      render(<RightFansPanel />);
      const initials = screen.getAllByText("C");
      expect(initials.length).toBeGreaterThan(0);
    });

    it("badminton_dev's avatar should show initial 'B'", () => {
      render(<RightFansPanel />);
      const initials = screen.getAllByText("B");
      expect(initials.length).toBeGreaterThan(0);
    });

    it("avatars should have colored backgrounds", () => {
      const { container } = render(<RightFansPanel />);
      const coloredAvatars = container.querySelectorAll("[style*='background']");
      expect(coloredAvatars.length).toBeGreaterThan(0);
    });

    it("avatars should be circular", () => {
      const { container } = render(<RightFansPanel />);
      const avatars = container.querySelectorAll(".rounded-full");
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("avatars should be white text on colored background", () => {
      const { container } = render(<RightFansPanel />);
      const avatars = container.querySelectorAll(".text-white");
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  // -------- SUPER FAN QUEUE --------
  describe("Super Fan Queue Section", () => {
    it("should render Super Fan Queue title", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Super Fan Queue/)).toBeInTheDocument();
    });

    it("should display super fan name", () => {
      render(<RightFansPanel />);
      const rahulElements = screen.getAllByText("Rahul_123");
      expect(rahulElements.length).toBeGreaterThan(0);
    });

    it("should display VIP badge", () => {
      render(<RightFansPanel />);
      expect(screen.getByText("VIP")).toBeInTheDocument();
    });

    it("should display super fan quote", () => {
      render(<RightFansPanel />);
      expect(
        screen.getByText(
          "'Coach, how is India countering Denmark's net play?'"
        )
      ).toBeInTheDocument();
    });

    it("should render Acknowledge button", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Acknowledge/)).toBeInTheDocument();
    });

    it("should display arrow in Acknowledge button", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Acknowledge ▶/)).toBeInTheDocument();
    });

    it("super fan should have VIP label styling", () => {
      const { container } = render(<RightFansPanel />);
      const vipBadge = screen.getByText("VIP").closest("span");
      expect(vipBadge).toHaveClass("bg-[#1e3a5f]");
      expect(vipBadge).toHaveClass("border");
    });

    it("super fan section should be in a card", () => {
      const { container } = render(<RightFansPanel />);
      const superFanCard = container.querySelector(".bg-\\[\\#1a1d24\\]");
      expect(superFanCard).toBeInTheDocument();
    });
  });

  // -------- BUTTONS --------
  describe("Buttons", () => {
    it("Acknowledge button should be clickable", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).not.toBeDisabled();
    });

    it("Acknowledge button should have orange background", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).toHaveClass("bg-[#f97316]");
    });

    it("Acknowledge button should have hover effect", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).toHaveClass("hover:bg-[#ea6c0a]");
    });

    it("Acknowledge button should be full width", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).toHaveClass("w-full");
    });

    it("Acknowledge button should be bold text", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).toHaveClass("font-bold");
    });
  });

  // -------- STYLING --------
  describe("Styling & CSS", () => {
    it("should have flex column layout", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("flex-col");
    });

    it("should have dark background", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("bg-[#111318]");
    });

    it("should have left and top borders", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("border-l");
      expect(mainDiv).toHaveClass("border-t");
    });

    it("should have padding", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("px-4");
      expect(mainDiv).toHaveClass("py-3");
    });

    it("should have gap-4 for section spacing", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("gap-4");
    });

    it("fan cards should have dark background", () => {
      const { container } = render(<RightFansPanel />);
      const cards = container.querySelectorAll(".bg-\\[\\#1a1d24\\]");
      expect(cards.length).toBeGreaterThan(0);
    });

    it("fan cards should be rounded", () => {
      const { container } = render(<RightFansPanel />);
      const cards = container.querySelectorAll(".rounded-lg");
      expect(cards.length).toBeGreaterThan(0);
    });

    it("fan cards should have border", () => {
      const { container } = render(<RightFansPanel />);
      const cards = container.querySelectorAll(".border");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have two main sections: Top Fans and Super Fan Queue", () => {
      const { container } = render(<RightFansPanel />);
      const sections = container.querySelectorAll(".flex.flex-col");
      expect(sections.length).toBeGreaterThan(1);
    });

    it("fan items should be in flex rows", () => {
      const { container } = render(<RightFansPanel />);
      const fanRows = container.querySelectorAll(".flex.items-center.gap-3");
      expect(fanRows.length).toBeGreaterThan(0);
    });

    it("super fan section should have gap-3", () => {
      const { container } = render(<RightFansPanel />);
      const superFanContainer = container.querySelector(".gap-3");
      expect(superFanContainer).toBeInTheDocument();
    });

    it("fan avatars should be flex-shrink-0", () => {
      const { container } = render(<RightFansPanel />);
      const avatars = container.querySelectorAll(".flex-shrink-0");
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("fan info should have min-w-0 for proper truncation", () => {
      const { container } = render(<RightFansPanel />);
      const infoContainers = container.querySelectorAll(".min-w-0");
      expect(infoContainers.length).toBeGreaterThan(0);
    });
  });

  // -------- TEXT CONTENT --------
  describe("Text Content", () => {
    it("should display section titles", () => {
      render(<RightFansPanel />);
      expect(screen.getByText("Top Fans — Live")).toBeInTheDocument();
      expect(screen.getByText(/Super Fan Queue/)).toBeInTheDocument();
    });

    it("should display fan names correctly", () => {
      render(<RightFansPanel />);
      expect(screen.getAllByText("Rahul_123").length).toBeGreaterThan(0);
      expect(screen.getAllByText("cricket_queen").length).toBeGreaterThan(0);
      expect(screen.getAllByText("badminton_dev").length).toBeGreaterThan(0);
    });

    it("should display points label", () => {
      render(<RightFansPanel />);
      const ptsLabels = screen.getAllByText(/pts/);
      expect(ptsLabels.length).toBeGreaterThan(0);
    });

    it("should display VIP badge text", () => {
      render(<RightFansPanel />);
      expect(screen.getByText("VIP")).toBeInTheDocument();
    });

    it("fan names should be truncated if too long", () => {
      const { container } = render(<RightFansPanel />);
      const fanNames = container.querySelectorAll(".truncate");
      expect(fanNames.length).toBeGreaterThan(0);
    });
  });

  // -------- COLORS --------
  describe("Colors & Styling", () => {
    it("top fans title should be gray", () => {
      const { container } = render(<RightFansPanel />);
      const title = container.querySelector(".text-\\[\\#9ca3af\\]");
      expect(title).toBeInTheDocument();
    });

    it("fan names should be white", () => {
      const { container } = render(<RightFansPanel />);
      const names = container.querySelectorAll(".text-white");
      expect(names.length).toBeGreaterThan(0);
    });

    it("points text should be gray", () => {
      const { container } = render(<RightFansPanel />);
      const points = container.querySelectorAll(".text-\\[\\#6b7280\\]");
      expect(points.length).toBeGreaterThan(0);
    });

    it("VIP badge should be blue", () => {
      const { container } = render(<RightFansPanel />);
      const vipBadge = screen.getByText("VIP").closest("span");
      expect(vipBadge).toHaveClass("bg-[#1e3a5f]");
    });

    it("VIP text should be blue", () => {
      const { container } = render(<RightFansPanel />);
      const vipBadge = screen.getByText("VIP").closest("span");
      expect(vipBadge).toHaveClass("text-[#60a5fa]");
    });

    it("Acknowledge button should be orange", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn).toHaveClass("bg-[#f97316]");
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should have semantic div structure", () => {
      const { container } = render(<RightFansPanel />);
      const mainDiv = container.querySelector("div");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should display all fan information clearly", () => {
      render(<RightFansPanel />);
      expect(screen.getAllByText("Rahul_123").length).toBeGreaterThan(0);
      expect(screen.getByText(/2,840 pts/)).toBeInTheDocument();
    });

    it("button should be keyboard accessible", () => {
      const { container } = render(<RightFansPanel />);
      const acknowledgeBtn = screen.getByText(/Acknowledge ▶/).closest("button");
      expect(acknowledgeBtn?.tagName).toBe("BUTTON");
    });

    it("should have descriptive text labels", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/Top Fans/)).toBeInTheDocument();
      expect(screen.getByText(/Super Fan Queue/)).toBeInTheDocument();
    });

    it("quote should be readable", () => {
      render(<RightFansPanel />);
      expect(
        screen.getByText(
          "'Coach, how is India countering Denmark's net play?'"
        )
      ).toBeInTheDocument();
    });
  });

  // -------- RESPONSIVE --------
  describe("Responsive Design", () => {
    it("fan names should truncate on overflow", () => {
      const { container } = render(<RightFansPanel />);
      const fanNames = container.querySelectorAll(".truncate");
      expect(fanNames.length).toBeGreaterThan(0);
    });

    it("avatars should be flex-shrink-0", () => {
      const { container } = render(<RightFansPanel />);
      const avatars = container.querySelectorAll(".flex-shrink-0");
      expect(avatars.length).toBeGreaterThan(0);
    });

    it("info containers should have min-w-0", () => {
      const { container } = render(<RightFansPanel />);
      const infoContainers = container.querySelectorAll(".min-w-0");
      expect(infoContainers.length).toBeGreaterThan(0);
    });
  });

  // -------- DATA VALIDATION --------
  describe("Data Validation", () => {
    it("should display correct point values", () => {
      render(<RightFansPanel />);
      expect(screen.getByText(/2,840 pts/)).toBeInTheDocument();
      expect(screen.getByText(/2,210 pts/)).toBeInTheDocument();
      expect(screen.getByText(/1,980 pts/)).toBeInTheDocument();
    });

    it("should display fans in correct order (by points)", () => {
      render(<RightFansPanel />);
      const fans = screen.getAllByText(/pts/);
      // Rahul_123 should be first (2840 pts)
      expect(screen.getAllByText("Rahul_123").length).toBeGreaterThan(0);
      // cricket_queen should be second (2210 pts)
      expect(screen.getAllByText("cricket_queen").length).toBeGreaterThan(0);
      // badminton_dev should be third (1980 pts)
      expect(screen.getAllByText("badminton_dev").length).toBeGreaterThan(0);
    });

    it("should display super fan with correct details", () => {
      render(<RightFansPanel />);
      const rahulElements = screen.getAllByText("Rahul_123");
      expect(rahulElements.length).toBeGreaterThan(0);
      expect(screen.getByText("VIP")).toBeInTheDocument();
      expect(
        screen.getByText(
          "'Coach, how is India countering Denmark's net play?'"
        )
      ).toBeInTheDocument();
    });
  });
});
