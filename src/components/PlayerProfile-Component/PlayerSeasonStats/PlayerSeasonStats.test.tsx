import { render, screen, fireEvent } from "@testing-library/react";
import PlayerSeasonStats from "./index";
import { Player } from "@/types/player";

describe("PlayerSeasonStats Component", () => {
  // Mock data
  const mockPlayer: any = {
    name: "Suryakumar Yadav",
    team: "Mumbai Indians",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    avatar: "/images/surya.jpg",
    about: "Talented middle-order batsman",
    stats: {
      runs: "12000",
      sr: "140.5",
      avg: "45.2",
    },
    overview: {
      debut: "2018",
      specialization: "Batting",
      dob: "1990-09-14",
      matches: "120",
    },
    season: {
      year: "2023",
      runs: "1080",
      strikeRate: "156.5",
      average: "45.0",
      fiftiesAndHundreds: "1/0",
      highestScore: "148",
      fours: 48,
      sixes: 22,
      award: "Man of the Match",
      awardSub: "Final Match 2023",
    },
    insights: [
      {
        title: "Consistency",
        description: "Maintained consistent performance throughout the season",
      },
      {
        title: "Strike Rate Improvement",
        description: "Improved strike rate significantly with aggressive batting",
      },
    ],
    strengths: [],
    media: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== SEASON HEADER TESTS ==========

  it("should render IPL Season section label with year", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    expect(screen.getByText(`IPL ${mockPlayer.season.year} Season`)).toBeInTheDocument();
  });

  // ========== TOP STATS TESTS ==========

  it("should render top stats: Runs, Strike Rate, Average with values", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.season.runs)).toBeInTheDocument();

    const avgElements = screen.getAllByText("Average");
    expect(avgElements.length).toBeGreaterThan(0);
    expect(screen.getByText(mockPlayer.season.average)).toBeInTheDocument();
  });

  // ========== SECONDARY STATS TESTS ==========

  it("should render secondary stats labels and values", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    expect(screen.getByText(/50s \/ 100s/i)).toBeInTheDocument();
    expect(screen.getByText("Highest Score")).toBeInTheDocument();
    expect(screen.getByText("Fours")).toBeInTheDocument();
    expect(screen.getByText("Sixes")).toBeInTheDocument();

    expect(screen.getByText(mockPlayer.season.highestScore)).toBeInTheDocument();
    expect(screen.getByText(String(mockPlayer.season.fours))).toBeInTheDocument();
    expect(screen.getByText(String(mockPlayer.season.sixes))).toBeInTheDocument();
  });

  // ========== AWARD BADGE TESTS ==========

  it("should render award section with title and subtitle", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    expect(screen.getByText(/Man of the Match/i)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.season.awardSub)).toBeInTheDocument();
  });

  // ========== BUTTON TESTS ==========

  it("should render View More buttons and allow clicks", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    const buttons = screen.getAllByRole("button", { name: /View More/ });
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toBeInTheDocument();
  });

  // ========== CAREER INSIGHTS TESTS ==========

  it("should render Career Insights section with all insights descriptions", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    expect(screen.getByText("Career Insights")).toBeInTheDocument();

    mockPlayer.insights.forEach((insight: any) => {
      expect(screen.getByText(insight.description)).toBeInTheDocument();
    });
  });

  // ========== STYLING TESTS ==========

  it("should render cards with dark background and pink accents", () => {
    const { container } = render(<PlayerSeasonStats player={mockPlayer} />);

    const darkCards = container.querySelectorAll("[class*='bg-\\[#1a1a1a\\]']");
    expect(darkCards.length).toBeGreaterThanOrEqual(2);

    const accentBars = container.querySelectorAll("div.bg-\\[\\#e91e8c\\]");
    expect(accentBars.length).toBeGreaterThan(0);
  });

  // ========== GRID LAYOUT TESTS ==========

  it("should render stats in proper grid layouts", () => {
    const { container } = render(<PlayerSeasonStats player={mockPlayer} />);

    const gridsThreeCol = container.querySelectorAll(".grid.grid-cols-3");
    const gridsTwoCol = container.querySelectorAll(".grid.grid-cols-2");

    expect(gridsThreeCol.length).toBeGreaterThan(0);
    expect(gridsTwoCol.length).toBeGreaterThan(0);
  });

  // ========== EDGE CASES ==========

  it("should handle empty insights array", () => {
    const playerWithoutInsights = {
      ...mockPlayer,
      insights: [],
    };

    render(<PlayerSeasonStats player={playerWithoutInsights} />);

    expect(screen.getByText("Career Insights")).toBeInTheDocument();
  });

  it("should handle large stat values", () => {
    const playerWithLargeStats = {
      ...mockPlayer,
      season: {
        ...mockPlayer.season,
        runs: "9999",
        fours: 999,
        sixes: 999,
      },
    };

    render(<PlayerSeasonStats player={playerWithLargeStats} />);

    expect(screen.getByText("9999")).toBeInTheDocument();
  });

  it("should handle single insight", () => {
    const playerWithOneInsight = {
      ...mockPlayer,
      insights: [
        {
          title: "Performance",
          description: "Outstanding season performance",
        },
      ],
    };

    render(<PlayerSeasonStats player={playerWithOneInsight} />);

    expect(screen.getByText("Outstanding season performance")).toBeInTheDocument();
  });

  // ========== COMPLETE LAYOUT TEST ==========

  it("should render complete season stats layout with all sections", () => {
    render(<PlayerSeasonStats player={mockPlayer} />);

    // Season header
    expect(screen.getByText(`IPL ${mockPlayer.season.year} Season`)).toBeInTheDocument();

    // Top stats
    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.season.runs)).toBeInTheDocument();

    // Secondary stats
    expect(screen.getByText("Highest Score")).toBeInTheDocument();
    expect(screen.getByText("Fours")).toBeInTheDocument();

    // Award
    expect(screen.getByText(/Man of the Match/i)).toBeInTheDocument();

    // Insights
    expect(screen.getByText("Career Insights")).toBeInTheDocument();
  });
});
