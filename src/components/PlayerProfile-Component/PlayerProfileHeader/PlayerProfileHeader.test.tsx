import { render, screen } from "@testing-library/react";
import PlayerProfileHeader from "./index";
import { Player } from "@/types/player";

describe("PlayerProfileHeader Component", () => {
  // Mock data
  const mockPlayer: any = {
    name: "Virat Kohli",
    team: "India",
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    avatar: "/images/virat.jpg",
    about: "Indian cricketer and captain known for his aggressive batting style and consistency. One of the greatest modern-day cricketers.",
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
    insights: [],
    strengths: [],
    media: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== AVATAR TESTS ==========

  it("should render player avatar image", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const avatar = screen.getByAltText(mockPlayer.name);
    expect(avatar).toBeInTheDocument();
  });

  it("should have gradient border around avatar", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const gradientDiv = container.querySelector("[class*='bg-gradient-to-br']");
    expect(gradientDiv).toBeInTheDocument();
  });

  it("should render avatar with correct dimensions", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const avatarContainer = container.querySelector("[class*='w-28']");
    expect(avatarContainer).toBeInTheDocument();
  });

  // ========== NAME AND TEAM TESTS ==========

  it("should render player name", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByRole("heading", { name: mockPlayer.name })).toBeInTheDocument();
  });

  it("should render player team", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.team)).toBeInTheDocument();
  });

  it("should render name as heading element", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const heading = screen.getByRole("heading");
    expect(heading.textContent).toBe(mockPlayer.name);
  });

  // ========== STYLE PILLS TESTS ==========

  it("should render batting style pill", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.battingStyle)).toBeInTheDocument();
  });

  it("should render bowling style pill", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.bowlingStyle)).toBeInTheDocument();
  });

  it("should render both style pills", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.battingStyle)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.bowlingStyle)).toBeInTheDocument();
  });

  // ========== ABOUT SECTION TESTS ==========

  it("should render About section label", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should render player biography text", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.about)).toBeInTheDocument();
  });

  it("should render about section with dark background", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const aboutCard = container.querySelector("[class*='bg-\\[#1a1a1a\\]']");
    expect(aboutCard).toBeInTheDocument();
  });

  // ========== STYLING TESTS ==========

  it("should have pink accent bar in About label", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const accentBars = container.querySelectorAll("div.bg-\\[\\#e91e8c\\]");
    expect(accentBars.length).toBeGreaterThan(0);
  });

  it("should render team name in pink color", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const teamElement = screen.getByText(mockPlayer.team);
    expect(teamElement).toHaveClass("text-[#e91e8c]");
  });

  it("should render bowling style pill with pink background", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const bowlingPill = screen.getByText(mockPlayer.bowlingStyle);
    expect(bowlingPill).toHaveClass("bg-[#e91e8c]");
  });

  it("should render batting style pill with borders", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const battingPill = screen.getByText(mockPlayer.battingStyle);
    expect(battingPill).toHaveClass("border");
  });

  // ========== EDGE CASES ==========

  it("should handle long player names", () => {
    const playerWithLongName = {
      ...mockPlayer,
      name: "Virat Singh Kohli Sharma",
    };

    render(<PlayerProfileHeader player={playerWithLongName} />);

    expect(
      screen.getByRole("heading", { name: "Virat Singh Kohli Sharma" })
    ).toBeInTheDocument();
  });

  it("should handle long team names", () => {
    const playerWithLongTeam = {
      ...mockPlayer,
      team: "Mumbai Indians Royal Challengers",
    };

    render(<PlayerProfileHeader player={playerWithLongTeam} />);

    expect(screen.getByText("Mumbai Indians Royal Challengers")).toBeInTheDocument();
  });

  it("should handle long about text", () => {
    const playerWithLongAbout = {
      ...mockPlayer,
      about: "A very talented cricketer with exceptional skills in batting and fielding. Known for aggressive play and consistent performance across all formats of the game. Has led the team to multiple victories.",
    };

    render(<PlayerProfileHeader player={playerWithLongAbout} />);

    expect(screen.getByText(playerWithLongAbout.about)).toBeInTheDocument();
  });

  it("should handle short team name", () => {
    const playerWithShortTeam = {
      ...mockPlayer,
      team: "RCB",
    };

    render(<PlayerProfileHeader player={playerWithShortTeam} />);

    expect(screen.getByText("RCB")).toBeInTheDocument();
  });

  it("should handle special characters in player name", () => {
    const playerWithSpecialChars = {
      ...mockPlayer,
      name: "Virat Kohli-Singh",
    };

    render(<PlayerProfileHeader player={playerWithSpecialChars} />);

    expect(
      screen.getByRole("heading", { name: "Virat Kohli-Singh" })
    ).toBeInTheDocument();
  });

  // ========== LAYOUT TESTS ==========

  it("should render header as centered layout", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("flex", "flex-col", "items-center");
  });

  it("should render with proper spacing", () => {
    const { container } = render(<PlayerProfileHeader player={mockPlayer} />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("gap-4");
  });

  // ========== IMAGE TESTS ==========

  it("should display avatar image with correct src", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const avatar = screen.getByAltText(mockPlayer.name) as HTMLImageElement;
    expect(avatar.src).toContain(mockPlayer.avatar);
  });

  it("should have avatar alt text as player name", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const avatar = screen.getByAltText(mockPlayer.name);
    expect(avatar).toHaveAttribute("alt", mockPlayer.name);
  });

  // ========== COMPLETE LAYOUT TEST ==========

  it("should render complete player profile header with all elements", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    // Avatar
    expect(screen.getByAltText(mockPlayer.name)).toBeInTheDocument();

    // Name and Team
    expect(screen.getByRole("heading", { name: mockPlayer.name })).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.team)).toBeInTheDocument();

    // Style pills
    expect(screen.getByText(mockPlayer.battingStyle)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.bowlingStyle)).toBeInTheDocument();

    // About section
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.about)).toBeInTheDocument();
  });

  it("should render batting style before bowling style", () => {
    render(<PlayerProfileHeader player={mockPlayer} />);

    const battingElement = screen.getByText(mockPlayer.battingStyle);
    const bowlingElement = screen.getByText(mockPlayer.bowlingStyle);

    expect(battingElement.compareDocumentPosition(bowlingElement)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
