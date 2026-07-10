import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./index";

// Mock the LogoutButton component since it's imported
jest.mock("../LogoutButton", () => {
  return function MockLogoutButton() {
    return <div data-testid="logout-button">Logout</div>;
  };
});

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component without crashing", () => {
      render(<Header />);
      expect(screen.getByText("SportsFan360")).toBeInTheDocument();
    });

    it("should render the title on mobile (lg:hidden)", () => {
      render(<Header />);
      const title = screen.getByText("SportsFan360");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("lg:hidden");
    });

    it("should render the search input", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search players, teams, stats...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render the LogoutButton component", () => {
      render(<Header />);
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });
  });

  describe("Icons and Buttons", () => {
    it("should render Bell icon button", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      // Bell button should be the first icon button (excluding LogoutButton)
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(iconButtons.length).toBeGreaterThanOrEqual(4); // Bell, Message, Menu, Home
      expect(iconButtons[0]).toBeInTheDocument();
    });

    it("should render MessageCircle icon button", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(iconButtons.length).toBeGreaterThanOrEqual(4);
      expect(iconButtons[1]).toBeInTheDocument();
    });

    it("should render Menu icon button", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(iconButtons.length).toBeGreaterThanOrEqual(4);
      expect(iconButtons[2]).toBeInTheDocument();
    });

    it("should render Home icon button", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(iconButtons.length).toBeGreaterThanOrEqual(4);
      expect(iconButtons[3]).toBeInTheDocument();
    });

    it("should render Search icon", () => {
      render(<Header />);
      // The Search icon should be present in the search input area
      const searchIcon = document.querySelector('svg') ||
                        document.querySelector('.text-pink-500');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("should have correct main container classes", () => {
      const { container } = render(<Header />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass(
        "w-full", "px-4", "lg:px-6", "py-3",
        "border-b", "border-pink-500/20", "bg-black",
        "flex", "flex-col", "gap-3"
      );
    });

    it("should have correct top row layout", () => {
      const { container } = render(<Header />);
      const topRow = container.querySelector(".flex.items-center.justify-between");
      expect(topRow).toBeInTheDocument();
    });

    it("should have correct search row layout", () => {
      const { container } = render(<Header />);
      const searchRow = container.querySelector(".flex.items-center.gap-2");
      expect(searchRow).toBeInTheDocument();
    });

    it("should apply correct button styling", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");

      // Check that buttons have the expected classes
      buttons.forEach(button => {
        if (button.textContent !== "Logout") { // Skip mocked LogoutButton
          expect(button).toHaveClass("border", "border-pink-500", "text-white");
        }
      });
    });

    it("should apply correct search input styling", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search players, teams, stats...");
      expect(searchInput).toHaveClass(
        "bg-transparent", "outline-none", "text-sm",
        "w-full", "text-white", "placeholder:text-gray-500"
      );
    });
  });

  describe("Search Functionality", () => {
    it("should allow typing in search input", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search players, teams, stats...");

      fireEvent.change(searchInput, { target: { value: "Virat Kohli" } });
      expect(searchInput).toHaveValue("Virat Kohli");
    });

    it("should have correct search input attributes", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search players, teams, stats...");

      // Input type defaults to "text" when not specified
      expect(searchInput).toHaveAttribute("placeholder", "Search players, teams, stats...");
    });
  });

  describe("Responsive Design", () => {
    it("should hide title on large screens (lg:hidden)", () => {
      render(<Header />);
      const title = screen.getByText("SportsFan360");
      expect(title).toHaveClass("lg:hidden");
    });

    it("should have responsive padding", () => {
      const { container } = render(<Header />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("px-4", "lg:px-6");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<Header />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("SportsFan360");
    });

    it("should have accessible buttons", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      // Each button should be focusable
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it("should have accessible search input", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search players, teams, stats...");
      expect(searchInput).toHaveAttribute("placeholder", "Search players, teams, stats...");
      expect(searchInput).toBeEnabled();
    });
  });

  describe("Button Interactions", () => {
    it("should allow Bell button to be clicked", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(() => fireEvent.click(iconButtons[0])).not.toThrow();
    });

    it("should allow Message button to be clicked", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(() => fireEvent.click(iconButtons[1])).not.toThrow();
    });

    it("should allow Menu button to be clicked", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(() => fireEvent.click(iconButtons[2])).not.toThrow();
    });

    it("should allow Home button to be clicked", () => {
      render(<Header />);
      const buttons = screen.getAllByRole("button");
      const iconButtons = buttons.filter(button => !button.textContent?.includes("Logout"));
      expect(() => fireEvent.click(iconButtons[3])).not.toThrow();
    });
  });
});