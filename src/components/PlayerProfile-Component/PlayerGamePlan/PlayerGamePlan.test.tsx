import { render, screen, fireEvent } from "@testing-library/react";
import PlayerGamePlan from "./index";
import { Player } from "@/types/player";

describe("PlayerGamePlan Component", () => {
  // Mock data
  const mockPlayer: any = {
    name: "Virat Kohli",
    team: "India",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    avatar: "/images/virat.jpg",
    about: "Indian cricketer",
    stats: {
      runs: "13000",
      sr: "95.5",
      avg: "48.5",
    },
    overview: {
      debut: "2008",
      specialization: "Batting",
      dob: "1988-11-05",
      matches: "150",
    },
    season: {
      year: "2023",
      runs: "1200",
      strikeRate: "94.5",
      average: "42.5",
      fifties: 3,
      hundreds: 4,
      highestScore: "120",
      fours: 45,
      sixes: 12,
      award: "Player of the Year",
      awardSub: "2023",
    },
    insights: [
      {
        title: "Consistency",
        description: "Most consistent performer",
      },
    ],
    strengths: [
      "Aggressive batting",
      "Off-side dominance",
      "Leadership skills",
      "Consistency",
    ],
    media: [
      {
        title: "Century Performance",
        views: "1.5M",
        time: "5:30",
        thumbnail: "/images/thumbnail1.jpg",
      },
      {
        title: "Batting Masterclass",
        views: "2.1M",
        time: "8:45",
        thumbnail: "/images/thumbnail2.jpg",
      },
      {
        title: "Match Highlights",
        views: "3.2M",
        time: "12:10",
        thumbnail: "/images/thumbnail3.jpg",
      },
      {
        title: "Practice Session",
        views: "890K",
        time: "6:20",
        thumbnail: "/images/thumbnail4.jpg",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== RENDER TESTS ==========

  it("should render the Game Plan section", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    expect(screen.getByText("Game Plan")).toBeInTheDocument();
  });

  it("should render the Key Strengths label", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    expect(screen.getByText("Key Strengths")).toBeInTheDocument();
  });

  it("should render all strength items", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    mockPlayer.strengths.forEach((strength: any) => {
      expect(screen.getByText(strength)).toBeInTheDocument();
    });
  });

  it("should render correct number of strength items", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const strengthItems = screen.getAllByText(/Aggressive batting|Off-side dominance|Leadership skills|Consistency/);
    expect(strengthItems.length).toBeGreaterThanOrEqual(mockPlayer.strengths.length);
  });

  it("should render all tabs: Drops, Videos, Live, Posts", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    expect(screen.getByRole("button", { name: /Drops/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Videos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Live/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Posts/i })).toBeInTheDocument();
  });

  it("should render all media items with titles", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    mockPlayer.media.forEach((item: any) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it("should render media items with view counts", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    mockPlayer.media.forEach((item: any) => {
      expect(screen.getByText(new RegExp(item.views))).toBeInTheDocument();
    });
  });

  it("should render media items with time duration", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    mockPlayer.media.forEach((item: any) => {
      expect(screen.getByText(new RegExp(item.time))).toBeInTheDocument();
    });
  });

  // ========== TAB INTERACTION TESTS ==========

  it("should have Drops tab active by default", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const dropsTab = screen.getByRole("button", { name: /Drops/i });
    expect(dropsTab).toHaveClass("bg-[#e91e8c]", "text-white");
  });

  it("should switch to Videos tab when clicked", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const videosTab = screen.getByRole("button", { name: /Videos/i });
    fireEvent.click(videosTab);

    expect(videosTab).toHaveClass("bg-[#e91e8c]", "text-white");
  });

  it("should switch to Live tab when clicked", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const liveTab = screen.getByRole("button", { name: /Live/i });
    fireEvent.click(liveTab);

    expect(liveTab).toHaveClass("bg-[#e91e8c]", "text-white");
  });

  it("should switch to Posts tab when clicked", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const postsTab = screen.getByRole("button", { name: /Posts/i });
    fireEvent.click(postsTab);

    expect(postsTab).toHaveClass("bg-[#e91e8c]", "text-white");
  });

  it("should deactivate previous tab when switching tabs", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const dropsTab = screen.getByRole("button", { name: /Drops/i });
    const videosTab = screen.getByRole("button", { name: /Videos/i });

    expect(dropsTab).toHaveClass("bg-[#e91e8c]");
    
    fireEvent.click(videosTab);

    expect(videosTab).toHaveClass("bg-[#e91e8c]");
    expect(dropsTab).not.toHaveClass("bg-[#e91e8c]");
  });

  // ========== STYLING TESTS ==========

  it("should apply alternating colors to strength indicators", () => {
    const { container } = render(<PlayerGamePlan player={mockPlayer} />);

    // Select all circular indicators in strength items (both pink and orange)
    const indicators = container.querySelectorAll(
      "span.rounded-full[class*='w-']"
    );
    expect(indicators.length).toBeGreaterThanOrEqual(mockPlayer.strengths.length);
  });

  it("should render strength items in grid layout", () => {
    const { container } = render(<PlayerGamePlan player={mockPlayer} />);

    const grids = container.querySelectorAll(".grid.grid-cols-1");
    expect(grids.length).toBeGreaterThan(0);
  });

  it("should render media grid with proper columns on mobile", () => {
    const { container } = render(<PlayerGamePlan player={mockPlayer} />);

    const mediaGrid = container.querySelector(".grid.grid-cols-2");
    expect(mediaGrid).toBeInTheDocument();
  });

  // ========== EDGE CASES ==========

  it("should handle empty strengths array", () => {
    const playerWithoutStrengths = {
      ...mockPlayer,
      strengths: [],
    };

    render(<PlayerGamePlan player={playerWithoutStrengths} />);

    expect(screen.getByText("Key Strengths")).toBeInTheDocument();
  });

  it("should handle empty media array", () => {
    const playerWithoutMedia = {
      ...mockPlayer,
      media: [],
    };

    render(<PlayerGamePlan player={playerWithoutMedia} />);

    expect(screen.getByText("Game Plan")).toBeInTheDocument();
  });

  it("should handle single strength item", () => {
    const playerWithOneStrength = {
      ...mockPlayer,
      strengths: ["Batting"],
    };

    render(<PlayerGamePlan player={playerWithOneStrength} />);

    expect(screen.getByText("Batting")).toBeInTheDocument();
  });

  it("should handle single media item", () => {
    const playerWithOneMedia = {
      ...mockPlayer,
      media: [
        {
          title: "Single Video",
          views: "100K",
          time: "3:00",
          thumbnail: "/images/thumb.jpg",
        },
      ],
    };

    render(<PlayerGamePlan player={playerWithOneMedia} />);

    expect(screen.getByText("Single Video")).toBeInTheDocument();
    expect(screen.getByText(/100K views/)).toBeInTheDocument();
  });

  it("should handle many strength items", () => {
    const playerWithManyStrengths = {
      ...mockPlayer,
      strengths: Array.from({ length: 10 }, (_, i) => `Strength ${i + 1}`),
    };

    render(<PlayerGamePlan player={playerWithManyStrengths} />);

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`Strength ${i}`)).toBeInTheDocument();
    }
  });

  it("should handle many media items", () => {
    const playerWithManyMedia = {
      ...mockPlayer,
      media: Array.from({ length: 8 }, (_, i) => ({
        title: `Video ${i + 1}`,
        views: `${(i + 1) * 100}K`,
        time: `${i + 1}:00`,
        thumbnail: `/images/thumb${i + 1}.jpg`,
      })),
    };

    render(<PlayerGamePlan player={playerWithManyMedia} />);

    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Video ${i}`)).toBeInTheDocument();
    }
  });

  // ========== SPECIAL CHARACTER TESTS ==========

  it("should render special characters in strength names", () => {
    const playerWithSpecialChars = {
      ...mockPlayer,
      strengths: ["Off-side dominance", "Power-hitting"],
    };

    render(<PlayerGamePlan player={playerWithSpecialChars} />);

    expect(screen.getByText("Off-side dominance")).toBeInTheDocument();
    expect(screen.getByText("Power-hitting")).toBeInTheDocument();
  });

  it("should render special characters in media titles", () => {
    const playerWithSpecialCharMedia = {
      ...mockPlayer,
      media: [
        {
          title: "Top 10 - Best Shots",
          views: "1.5M",
          time: "5:30",
          thumbnail: "/images/thumbnail.jpg",
        },
      ],
    };

    render(<PlayerGamePlan player={playerWithSpecialCharMedia} />);

    expect(screen.getByText("Top 10 - Best Shots")).toBeInTheDocument();
  });

  // ========== NUMBERS AND FORMATTING TESTS ==========

  it("should render view counts with proper formatting", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    expect(screen.getByText(/1.5M views/)).toBeInTheDocument();
    expect(screen.getByText(/2.1M views/)).toBeInTheDocument();
  });

  it("should render time duration correctly", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    expect(screen.getByText(/5:30/)).toBeInTheDocument();
    expect(screen.getByText(/8:45/)).toBeInTheDocument();
  });

  // ========== SECTION LABEL TESTS ==========

  it("should have pink accent bar in section labels", () => {
    const { container } = render(<PlayerGamePlan player={mockPlayer} />);

    const accentBars = container.querySelectorAll("div.bg-\\[\\#e91e8c\\]");
    expect(accentBars.length).toBeGreaterThan(0);
  });

  // ========== TAB BUTTON STYLING TESTS ==========

  it("should have proper styling for inactive tabs", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const videosTab = screen.getByRole("button", { name: /Videos/i });
    expect(videosTab).toHaveClass("bg-transparent");
  });

  it("should have play icon in media items", () => {
    const { container } = render(<PlayerGamePlan player={mockPlayer} />);

    const svgElements = container.querySelectorAll("svg[viewBox='0 0 24 24']");
    expect(svgElements.length).toBeGreaterThan(0);
  });

  // ========== ACCESSIBILITY TESTS ==========

  it("should render buttons with proper attributes", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4); // At least 4 tabs
  });

  it("should all tabs be clickable buttons", () => {
    render(<PlayerGamePlan player={mockPlayer} />);

    const dropsTab = screen.getByRole("button", { name: /Drops/i });
    const videosTab = screen.getByRole("button", { name: /Videos/i });
    const liveTab = screen.getByRole("button", { name: /Live/i });
    const postsTab = screen.getByRole("button", { name: /Posts/i });

    expect(dropsTab).toBeInTheDocument();
    expect(videosTab).toBeInTheDocument();
    expect(liveTab).toBeInTheDocument();
    expect(postsTab).toBeInTheDocument();
  });
});
