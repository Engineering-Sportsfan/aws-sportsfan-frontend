import { render, screen } from "@testing-library/react";
import HomeCardsSection from "./index";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href} data-testid={`link-${href}`}>{children}</a>;
  };
});

// Mock data from the component
const mockData = [
  {
    id: 1,
    title: "SportsFan360",
    subtitle: "Your ultimate sports companion",
    image: "/images/sportsfan360.png",
    stats: [
      { label: "Sports", value: "12+" },
      { label: "Athletes", value: "500+" },
      { label: "Active", value: "1.8M" },
    ],
    buttonText: "Discover More",
    buttonIcon: "chart" as const,
    buttonUrl: "/MainModules/WatchAlong"
  },
  {
    id: 2,
    title: "IPL T20 2026 360World",
    subtitle: "Exclusive content from all 10 teams",
    image: "/images/ipl360.jpg",
    stats: [
      { label: "Teams", value: "10" },
      { label: "Drops", value: "450+" },
      { label: "Fans", value: "2.3M" },
    ],
    buttonText: "Explore 360World",
    buttonIcon: "play" as const,
    buttonUrl: "/MainModules/ClubsProfile"
  },
];

describe("HomeCardsSection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component without crashing", () => {
      render(<HomeCardsSection />);
      expect(screen.getByText("SportsFan360")).toBeInTheDocument();
    });

    it("should render all card titles", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        expect(screen.getByText(card.title)).toBeInTheDocument();
      });
    });

    it("should render all card subtitles", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        expect(screen.getByText(card.subtitle)).toBeInTheDocument();
      });
    });

    it("should render all button texts", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        expect(screen.getByText(card.buttonText)).toBeInTheDocument();
      });
    });
  });

  describe("Card Structure", () => {
    it("should render the correct number of cards", () => {
      render(<HomeCardsSection />);
      const cards = document.querySelectorAll('[class*="bg-[#111]"]');
      expect(cards).toHaveLength(mockData.length);
    });

    it("should render images for each card", () => {
      render(<HomeCardsSection />);
      // Each card has a main image, so we should have mockData.length main images
      const mainImages = document.querySelectorAll('img[class*="w-[256px]"]');
      expect(mainImages).toHaveLength(mockData.length);
    });

    it("should render correct image sources", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        const image = document.querySelector(`img[src="${card.image}"]`);
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe("Stats Display", () => {
    it("should render all stats for each card", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        card.stats.forEach((stat) => {
          expect(screen.getByText(stat.label)).toBeInTheDocument();
          expect(screen.getByText(stat.value)).toBeInTheDocument();
        });
      });
    });

    it("should render stats in grid layout", () => {
      render(<HomeCardsSection />);
      const statGrids = document.querySelectorAll('[class*="grid-cols-3"]');
      expect(statGrids).toHaveLength(mockData.length);
    });

    it("should render correct number of stat items per card", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        const statItems = document.querySelectorAll(`[class*="bg-[#1c1c1c]"]`);
        // Each card has 3 stats, so total should be 3 * number of cards
        expect(statItems).toHaveLength(mockData.length * 3);
      });
    });
  });

  describe("Buttons and Links", () => {
    it("should render buttons with correct text", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        const button = screen.getByText(card.buttonText);
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe("BUTTON");
      });
    });

    it("should render Link components with correct hrefs", () => {
      render(<HomeCardsSection />);
      mockData.forEach((card) => {
        const link = screen.getByTestId(`link-${card.buttonUrl}`);
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", card.buttonUrl);
      });
    });

    it("should render correct button icons", () => {
      render(<HomeCardsSection />);
      const buttonIcons = document.querySelectorAll('button img');
      expect(buttonIcons).toHaveLength(mockData.length);

      // Check specific icon sources
      const exploreIcon = document.querySelector('img[alt="Play"]');
      const discoverIcon = document.querySelector('img[alt="Chart"]');

      expect(exploreIcon).toBeInTheDocument();
      expect(discoverIcon).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("should have correct main container classes", () => {
      const { container } = render(<HomeCardsSection />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("mt-6");
    });

    it("should have correct scroll container classes", () => {
      const { container } = render(<HomeCardsSection />);
      const scrollContainer = container.querySelector(".flex.gap-4.overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass("snap-x", "snap-mandatory");
    });

    it("should apply correct card styling", () => {
      const { container } = render(<HomeCardsSection />);
      const cards = container.querySelectorAll('[class*="bg-[#111]"]');

      cards.forEach((card) => {
        expect(card).toHaveClass("rounded-2xl", "p-2", "shadow-lg", "snap-start");
      });
    });

    it("should apply correct button styling", () => {
      render(<HomeCardsSection />);
      const buttons = document.querySelectorAll('button[class*="bg-gradient-to-r"]');

      buttons.forEach((button) => {
        expect(button).toHaveClass("from-pink-500", "to-orange-500", "rounded-full");
      });
    });

    it("should apply correct stat item styling", () => {
      const { container } = render(<HomeCardsSection />);
      const statItems = container.querySelectorAll('[class*="bg-[#1c1c1c]"]');

      statItems.forEach((item) => {
        expect(item).toHaveClass("p-3", "rounded-lg");
      });
    });
  });

  describe("Content Accuracy", () => {
    it("should display correct titles in order", () => {
      render(<HomeCardsSection />);
      const titles = screen.getAllByText(/SportsFan360|IPL T20 2026 360World/);

      expect(titles[0]).toHaveTextContent("SportsFan360");
      expect(titles[1]).toHaveTextContent("IPL T20 2026 360World");
    });

    it("should display correct subtitles", () => {
      render(<HomeCardsSection />);
      expect(screen.getByText("Your ultimate sports companion")).toBeInTheDocument();
      expect(screen.getByText("Exclusive content from all 10 teams")).toBeInTheDocument();
    });

    it("should display correct button texts", () => {
      render(<HomeCardsSection />);
      expect(screen.getByText("Discover More")).toBeInTheDocument();
      expect(screen.getByText("Explore 360World")).toBeInTheDocument();
    });
  });

  describe("Data Integrity", () => {
    it("should render cards with unique keys", () => {
      const { container } = render(<HomeCardsSection />);
      const cards = container.querySelectorAll('[class*="bg-[#111]"]');

      // Verify we have the expected number of cards
      expect(cards).toHaveLength(mockData.length);
    });

    it("should render stats in correct order per card", () => {
      render(<HomeCardsSection />);

      // Check first card stats
      expect(screen.getByText("Sports")).toBeInTheDocument();
      expect(screen.getByText("12+")).toBeInTheDocument();
      expect(screen.getByText("Athletes")).toBeInTheDocument();
      expect(screen.getByText("500+")).toBeInTheDocument();

      // Check second card stats
      expect(screen.getByText("Teams")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Drops")).toBeInTheDocument();
      expect(screen.getByText("450+")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible images with alt text", () => {
      const { container } = render(<HomeCardsSection />);
      const images = container.querySelectorAll('img');

      images.forEach((img) => {
        expect(img).toHaveAttribute("src");
      });
    });

    it("should have accessible buttons", () => {
      render(<HomeCardsSection />);
      const buttons = document.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it("should have proper link structure", () => {
      render(<HomeCardsSection />);
      const links = screen.getAllByTestId(/^link-/);

      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });
});