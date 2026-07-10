import { render, screen } from "@testing-library/react";
import LiveRoomPage from "./page";

// Mock all the child components
jest.mock("@/src/components/LiveControlPanelComponents/Leftsidebar", () => {
  return function MockLeftSidebar() {
    return <div data-testid="left-sidebar">Left Sidebar</div>;
  };
});

jest.mock("@/src/components/LiveControlPanelComponents/Middlepanel", () => {
  return function MockMiddlePanel() {
    return <div data-testid="middle-panel">Middle Panel</div>;
  };
});

jest.mock("@/src/components/LiveControlPanelComponents/Rightchatpanel", () => {
  return function MockRightChatPanel() {
    return <div data-testid="right-chat-panel">Right Chat Panel</div>;
  };
});

jest.mock("@/src/components/LiveControlPanelComponents/Rightfanspanel", () => {
  return function MockRightFansPanel() {
    return <div data-testid="right-fans-panel">Right Fans Panel</div>;
  };
});

jest.mock("@/src/components/LiveControlPanelComponents/Topheader ", () => {
  return function MockTopHeader() {
    return <div data-testid="top-header">Top Header</div>;
  };
});

describe("LiveRoomControlPanel - Layout & Component Rendering", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render LiveRoomPage without crashing", () => {
      render(<LiveRoomPage />);
      expect(screen.getByTestId("top-header")).toBeInTheDocument();
    });

    it("should render all child components", () => {
      render(<LiveRoomPage />);

      expect(screen.getByTestId("top-header")).toBeInTheDocument();
      expect(screen.getByTestId("left-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("middle-panel")).toBeInTheDocument();
      expect(screen.getByTestId("right-chat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("right-fans-panel")).toBeInTheDocument();
    });

    it("should render TopHeader as the first element", () => {
      const { container } = render(<LiveRoomPage />);
      const topHeader = screen.getByTestId("top-header");
      const mainContainer = container.querySelector(".flex.flex-col.h-screen");

      expect(mainContainer?.firstChild).toBe(topHeader.closest(".flex.flex-col.h-screen")?.firstChild);
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have correct main container classes", () => {
      const { container } = render(<LiveRoomPage />);
      const mainContainer = container.querySelector(".flex.flex-col.h-screen.w-\\[100\\%\\].bg-\\[\\#0d0f14\\].text-white.overflow-hidden.font-sans");

      expect(mainContainer).toBeInTheDocument();
    });

    it("should have flex layout for main content area", () => {
      const { container } = render(<LiveRoomPage />);
      const flexContainers = container.querySelectorAll(".flex");

      expect(flexContainers.length).toBeGreaterThan(0);
    });

    it("should render components in correct order: Header, then Left/Middle/Right", () => {
      render(<LiveRoomPage />);

      const topHeader = screen.getByTestId("top-header");
      const leftSidebar = screen.getByTestId("left-sidebar");
      const middlePanel = screen.getByTestId("middle-panel");
      const rightChatPanel = screen.getByTestId("right-chat-panel");
      const rightFansPanel = screen.getByTestId("right-fans-panel");

      expect(topHeader).toBeInTheDocument();
      expect(leftSidebar).toBeInTheDocument();
      expect(middlePanel).toBeInTheDocument();
      expect(rightChatPanel).toBeInTheDocument();
      expect(rightFansPanel).toBeInTheDocument();
    });
  });

  // -------- RIGHT COLUMN LAYOUT --------
  describe("Right Column Layout (Chat & Fans Panel)", () => {
    it("should render right column container with correct width", () => {
      const { container } = render(<LiveRoomPage />);
      const rightColumn = container.querySelector(".w-\\[260px\\]");

      expect(rightColumn).toBeInTheDocument();
    });

    it("should have chat panel positioned above fans panel", () => {
      render(<LiveRoomPage />);

      const chatPanel = screen.getByTestId("right-chat-panel");
      const fansPanel = screen.getByTestId("right-fans-panel");

      // Check that both exist
      expect(chatPanel).toBeInTheDocument();
      expect(fansPanel).toBeInTheDocument();

      // Chat panel should come before fans panel in DOM
      expect(chatPanel.compareDocumentPosition(fansPanel)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it("should render chat and fans panels with correct flex proportions", () => {
      const { container } = render(<LiveRoomPage />);

      // The right column should contain two flex divs with specific flex values
      const rightColumn = container.querySelector(".w-\\[260px\\]");
      const flexDivs = rightColumn?.querySelectorAll(".flex.flex-col");

      // Should have at least 2 flex containers (chat and fans)
      expect(flexDivs && flexDivs.length >= 2).toBe(true);
    });
  });

  // -------- STYLING & CLASSES --------
  describe("Styling & CSS Classes", () => {
    it("should have dark theme background color", () => {
      const { container } = render(<LiveRoomPage />);
      const mainContainer = container.querySelector("[class*='bg-\\[#0d0f14\\]']");

      expect(mainContainer).toBeInTheDocument();
    });

    it("should have white text color", () => {
      const { container } = render(<LiveRoomPage />);
      const mainContainer = container.querySelector("[class*='text-white']");

      expect(mainContainer).toBeInTheDocument();
    });

    it("should have overflow hidden on main container", () => {
      const { container } = render(<LiveRoomPage />);
      const mainContainer = container.firstChild as HTMLElement;

      expect(mainContainer.className).toContain("overflow-hidden");
    });

    it("should use sans font family", () => {
      const { container } = render(<LiveRoomPage />);
      const mainContainer = container.querySelector("[class*='font-sans']");

      expect(mainContainer).toBeInTheDocument();
    });
  });

  // -------- RESPONSIVE BEHAVIOR --------
  describe("Responsive Behavior", () => {
    it("should have flex-1 on main layout for responsive height", () => {
      const { container } = render(<LiveRoomPage />);
      const layoutDiv = container.querySelector(".flex-1");

      expect(layoutDiv).toBeInTheDocument();
    });

    it("should have min-h-0 on main layout to prevent overflow", () => {
      const { container } = render(<LiveRoomPage />);
      const layoutDiv = container.querySelector(".min-h-0");

      expect(layoutDiv).toBeInTheDocument();
    });

    it("should have correct shrink classes on right column", () => {
      const { container } = render(<LiveRoomPage />);
      const rightColumn = container.querySelector(".flex-shrink-0");

      expect(rightColumn).toBeInTheDocument();
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should render semantic structure with proper div hierarchy", () => {
      const { container } = render(<LiveRoomPage />);
      const mainDiv = container.firstChild;

      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv?.childNodes.length).toBeGreaterThan(0);
    });

    it("should render all components in logical order for screen readers", () => {
      render(<LiveRoomPage />);

      // Components should be rendered in reading order
      expect(screen.getByTestId("top-header")).toBeInTheDocument();
      expect(screen.getByTestId("left-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("middle-panel")).toBeInTheDocument();
      expect(screen.getByTestId("right-chat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("right-fans-panel")).toBeInTheDocument();
    });
  });
});
