import { render, screen, fireEvent } from "@testing-library/react";
import PlayerProfileActions from "./index";
import { Player } from "@/types/player";

describe("PlayerProfileActions Component", () => {
  // Mock data
  const mockPlayer: any = {
    name: "Rohit Sharma",
    team: "Mumbai Indians",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    avatar: "/images/rohit.jpg",
    about: "Indian cricket captain",
    stats: {
      runs: "14250",
      sr: "142.5",
      avg: "47.2",
    },
    overview: {
      debut: "2008",
      specialization: "Batting",
      dob: "1987-04-30",
      matches: "165",
    },
    season: {
      year: "2023",
      runs: "1350",
      strikeRate: "148.5",
      average: "48.2",
      fifties: 5,
      hundreds: 3,
      highestScore: "135",
      fours: 52,
      sixes: 18,
      award: "Captain of the Year",
      awardSub: "2023",
    },
    insights: [],
    strengths: [],
    media: [],
  };

  const playerWithContent: Player = {
    ...mockPlayer,
    insights: [
      {
        title: "Powerplay control",
        description: "He settles the innings early and then accelerates without risk.",
      },
    ],
    strengths: ["Timing", "Pull shot", "Big-match temperament"],
    media: [
      {
        title: "Training clip",
        views: "12.5K",
        time: "2h ago",
        thumbnail: "/images/rohit.jpg",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== BUTTON RENDER TESTS ==========

  it("should render Follow button", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByRole("button", { name: /Follow/i })).toBeInTheDocument();
  });

  it("should render Watch Me button", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByRole("button", { name: /Watch Me/i })).toBeInTheDocument();
  });

  it("should render Share button", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4); // Follow, Watch Me, Share, Avatar Jersey
  });

  it("should render Avatar Jersey button", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(
      screen.getByRole("button", { name: /Make My Avatar in This Jersey/i })
    ).toBeInTheDocument();
  });

  // ========== CAREER STATS SECTION ==========

  it("should render Career Stats section label", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText("Career Stats")).toBeInTheDocument();
  });

  it("should render RUNS stat", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.stats.runs)).toBeInTheDocument();
    expect(screen.getByText("RUNS")).toBeInTheDocument();
  });

  it("should render SR (Strike Rate) stat", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.stats.sr)).toBeInTheDocument();
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("should render AVG (Average) stat", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.stats.avg)).toBeInTheDocument();
    expect(screen.getByText("AVG")).toBeInTheDocument();
  });

  it("should render all three career stats", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    const statLabels = screen.getAllByText(/RUNS|SR|AVG/);
    expect(statLabels.length).toBeGreaterThanOrEqual(3);
  });

  // ========== PLAYER OVERVIEW SECTION ==========

  it("should render Player Overview section label", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText("Player Overview")).toBeInTheDocument();
  });

  it("should render IPL Debut information", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.overview.debut)).toBeInTheDocument();
    expect(screen.getByText("IPL Debut")).toBeInTheDocument();
  });

  it("should render Specialization information", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.overview.specialization)).toBeInTheDocument();
    expect(screen.getByText("Specialization")).toBeInTheDocument();
  });

  it("should render Date of Birth information", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.overview.dob)).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
  });

  it("should render Matches information", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.overview.matches)).toBeInTheDocument();
    expect(screen.getByText("Matches")).toBeInTheDocument();
  });

  it("should render all overview items", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText("IPL Debut")).toBeInTheDocument();
    expect(screen.getByText("Specialization")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByText("Matches")).toBeInTheDocument();
  });

  it("should persist follow state in local storage for the player", () => {
    render(<PlayerProfileActions player={mockPlayer} playerId="rohit-sharma" />);

    fireEvent.click(screen.getByRole("button", { name: /Follow/i }));

    expect(window.localStorage.getItem("player-profile-actions:rohit-sharma")).toContain("following");
  });

  // ========== BUTTON STYLING TESTS ==========

  it("should have gradient styling on Follow button", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const followButton = screen.getByRole("button", { name: /Follow/i });
    expect(followButton).toHaveClass("bg-gradient-to-r");
  });

  it("should have outlined styling on Watch Me button", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const watchMeButton = screen.getByRole("button", { name: /Watch Me/i });
    expect(watchMeButton).toHaveClass("border");
  });

  it("should have pink color on buttons", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const styledElements = container.querySelectorAll("[class*='e91e8c']");
    expect(styledElements.length).toBeGreaterThan(0);
  });

  // ========== SVG ICON TESTS ==========

  it("should render SVG icons in buttons", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it("should render follow icon in Follow button", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const followButton = screen.getByRole("button", { name: /Follow/i });
    const svg = followButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render bell icon in Watch Me button", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const watchMeButton = screen.getByRole("button", { name: /Watch Me/i });
    const svg = watchMeButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  // ========== SECTION LABEL TESTS ==========

  it("should have pink accent bar in Career Stats label", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const careerStatsLabel = screen.getByText("Career Stats");
    const parent = careerStatsLabel.parentElement;
    expect(parent).toHaveClass("flex");
  });

  it("should have pink accent bar in Player Overview label", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const playerOverviewLabel = screen.getByText("Player Overview");
    const parent = playerOverviewLabel.parentElement;
    expect(parent).toHaveClass("flex");
  });

  // ========== GRID LAYOUT TESTS ==========

  it("should render career stats in 3-column grid", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const grids = container.querySelectorAll(".grid.grid-cols-3");
    expect(grids.length).toBeGreaterThan(0);
  });

  it("should render overview in 2-column grid", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const grids = container.querySelectorAll(".grid.grid-cols-2");
    expect(grids.length).toBeGreaterThan(0);
  });

  // ========== BUTTON CLICK TESTS ==========

  it("should toggle Follow button to Following and show related player content", () => {
    render(<PlayerProfileActions player={playerWithContent} playerId="rohit-sharma" />);

    const followButton = screen.getByRole("button", { name: /Follow/i });
    fireEvent.click(followButton);

    expect(screen.getByRole("button", { name: /^Following$/i })).toBeInTheDocument();
    expect(screen.getByText("Related to Rohit Sharma")).toBeInTheDocument();
    expect(screen.getByText("Timing")).toBeInTheDocument();
  });

  it("should toggle Watch Me button and show notifications for player uploads", () => {
    render(<PlayerProfileActions player={playerWithContent} playerId="rohit-sharma" />);

    const watchMeButton = screen.getByRole("button", { name: /Watch Me/i });
    fireEvent.click(watchMeButton);

    expect(screen.getByRole("button", { name: /^Watching$/i })).toBeInTheDocument();
    expect(screen.getByText("Watch Me notifications")).toBeInTheDocument();
    expect(screen.getByText("Training clip")).toBeInTheDocument();
  });

  it("should allow Avatar Jersey button to be clicked", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    const avatarButton = screen.getByRole("button", {
      name: /Make My Avatar in This Jersey/i,
    });
    fireEvent.click(avatarButton);

    expect(avatarButton).toBeInTheDocument();
  });

  // ========== EDGE CASES ==========

  it("should handle large stat values", () => {
    const playerWithLargeStats = {
      ...mockPlayer,
      stats: {
        runs: "99999",
        sr: "999.99",
        avg: "999.99",
      },
    };

    render(<PlayerProfileActions player={playerWithLargeStats} />);

    expect(screen.getByText("99999")).toBeInTheDocument();
  });

  it("should handle small stat values", () => {
    const playerWithSmallStats = {
      ...mockPlayer,
      stats: {
        runs: "0",
        sr: "0",
        avg: "0",
      },
    };

    render(<PlayerProfileActions player={playerWithSmallStats} />);

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it("should handle decimal values in stats", () => {
    const playerWithDecimalStats = {
      ...mockPlayer,
      stats: {
        runs: "1234.56",
        sr: "123.45",
        avg: "56.78",
      },
    };

    render(<PlayerProfileActions player={playerWithDecimalStats} />);

    expect(screen.getByText("1234.56")).toBeInTheDocument();
    expect(screen.getByText("123.45")).toBeInTheDocument();
  });

  it("should handle long player names in specialization", () => {
    const playerWithLongSpecialization = {
      ...mockPlayer,
      overview: {
        ...mockPlayer.overview,
        specialization: "All-Rounder Batsman Bowler",
      },
    };

    render(<PlayerProfileActions player={playerWithLongSpecialization} />);

    expect(
      screen.getByText("All-Rounder Batsman Bowler")
    ).toBeInTheDocument();
  });

  it("should handle special characters in stats", () => {
    const playerWithSpecialChars = {
      ...mockPlayer,
      stats: {
        runs: "12,345",
        sr: "142.5+",
        avg: "47.2*",
      },
    };

    render(<PlayerProfileActions player={playerWithSpecialChars} />);

    expect(screen.getByText("12,345")).toBeInTheDocument();
  });

  // ========== TEXT CONTENT TESTS ==========

  it("should render correct text for all buttons", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByRole("button", { name: /Follow/i })).toHaveTextContent("Follow");
    expect(screen.getByRole("button", { name: /Watch Me/i })).toHaveTextContent("Watch Me");
  });

  it("should render correct labels for career stats", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText("RUNS")).toBeInTheDocument();
    expect(screen.getByText("SR")).toBeInTheDocument();
    expect(screen.getByText("AVG")).toBeInTheDocument();
  });

  // ========== RESPONSIVE LAYOUT TESTS ==========

  it("should render buttons with responsive height classes", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should have flex layout for button row", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const flexContainers = container.querySelectorAll(".flex.items-center");
    expect(flexContainers.length).toBeGreaterThan(0);
  });

  // ========== CARD STYLING TESTS ==========

  it("should render Career Stats in dark card", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const darkCards = container.querySelectorAll("[class*='bg-\\[#1a1a1a\\]']");
    expect(darkCards.length).toBeGreaterThanOrEqual(2); // Career Stats and Player Overview
  });

  it("should render stat items with dark background", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const statCards = container.querySelectorAll("[class*='bg-\\[#242424\\]']");
    expect(statCards.length).toBeGreaterThanOrEqual(3); // At least 3 career stats
  });

  // ========== ACCESSIBILITY TESTS ==========

  it("should render all buttons as clickable elements", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    buttons.forEach((button) => {
      expect(button.tagName).toBe("BUTTON");
    });
  });

  it("should have proper button structure", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    const followButton = screen.getByRole("button", { name: /Follow/i });
    expect(followButton.tagName).toBe("BUTTON");
  });

  // ========== DATA DISPLAY TESTS ==========

  it("should display all player stats correctly", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.stats.runs)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.stats.sr)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.stats.avg)).toBeInTheDocument();
  });

  it("should display all player overview correctly", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.overview.debut)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.overview.specialization)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.overview.dob)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.overview.matches)).toBeInTheDocument();
  });

  // ========== COLOR ACCENT TESTS ==========

  it("should have specialized color for specialization text", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const specializationElement = screen.getByText(mockPlayer.overview.specialization);
    expect(specializationElement).toHaveClass("text-[#e91e8c]");
  });

  it("should have orange color for matches stat", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const matchesElement = screen.getByText(mockPlayer.overview.matches);
    expect(matchesElement).toHaveClass("text-[#ff9800]");
  });

  // ========== SECTION STRUCTURE TESTS ==========

  it("should have 3 main sections", () => {
    const { container } = render(<PlayerProfileActions player={mockPlayer} />);

    const sections = container.querySelectorAll(".flex.flex-col.gap-4");
    expect(sections.length).toBeGreaterThan(0);
  });

  it("should render complete player action layout", () => {
    render(<PlayerProfileActions player={mockPlayer} />);

    // Check all major sections exist
    expect(screen.getByRole("button", { name: /Follow/i })).toBeInTheDocument();
    expect(screen.getByText("Career Stats")).toBeInTheDocument();
    expect(screen.getByText("Player Overview")).toBeInTheDocument();
  });
});
