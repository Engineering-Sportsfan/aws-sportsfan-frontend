import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import VideoDropCard from "./index";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockUseSearchParams = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("VideoDropCard", () => {
  const mockPlaylistResponse = {
    data: {
      success: true,
      playlists: [
        {
          id: "playlist-1",
          team360PostId: "team-1",
          audioDrops: [],
          videoDrops: [
            {
              title: "A Winning Strategy",
              description: "How the champions prepared.",
              views: 240000,
              signals: 125,
              duration: "4:32",
              durationSecs: 272,
              date: "2026-04-01",
              room: "Premium",
              engagement: 72,
              videoUrl: "https://example.com/video1.mp4",
              mediaUrl: "https://example.com/video1.mp4",
              thumbnail: "https://example.com/thumb1.jpg",
              listens: 240000,
            },
          ],
          createdAt: 1696000000000,
          updatedAt: 1696000000000,
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
      },
    },
  };

  let historyBackSpy: jest.SpyInstance;

  beforeAll(() => {
    historyBackSpy = jest.spyOn(window.history, "back").mockImplementation(() => undefined);
  });

  afterAll(() => {
    historyBackSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReset();
  });

  it("shows the loading indicator while fetching video data", async () => {
    mockedAxios.get.mockResolvedValueOnce(mockPlaylistResponse);
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<VideoDropCard />);

    expect(screen.getByText("Loading video...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading video...")).not.toBeInTheDocument();
    });
  });

  it("renders the video card for playlistId and videoIndex search params", async () => {
    mockedAxios.get.mockResolvedValueOnce(mockPlaylistResponse);
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?playlistId=playlist-1&videoIndex=0"));

    render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "A Winning Strategy" })).toBeInTheDocument();
      expect(screen.getByText("How the champions prepared.")).toBeInTheDocument();
      expect(screen.getByText(/2,40,000|240,000/)).toBeInTheDocument();
      expect(screen.getAllByText("4:32").length).toBeGreaterThan(0);
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/team360-playlist");
  });

  it("falls back to a placeholder video track when url search param is not found", async () => {
    mockedAxios.get.mockResolvedValueOnce(mockPlaylistResponse);
    const missingUrl = encodeURIComponent("https://example.com/missing.mp4");
    mockUseSearchParams.mockReturnValue(new URLSearchParams(`?url=${missingUrl}`));

    render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Video Track" })).toBeInTheDocument();
      expect(screen.queryByText("Unable to play video.")).not.toBeInTheDocument();
    });
  });

  it("decodes shortId and renders the matching video drop", async () => {
    const shortId = Buffer.from("playlist-1:0").toString("base64");
    mockedAxios.get.mockResolvedValueOnce(mockPlaylistResponse);
    mockUseSearchParams.mockReturnValue(new URLSearchParams(`?shortId=${shortId}`));

    render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "A Winning Strategy" })).toBeInTheDocument();
      expect(screen.getByText("How the champions prepared.")).toBeInTheDocument();
    });
  });

  it("shows an error message when the API call fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load video")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Go Back"));
    expect(historyBackSpy).toHaveBeenCalled();
  });

  it("shows a no-playlists error when the response contains no playlists", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: false,
        playlists: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
    });
    mockUseSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByText("No playlists available")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  it("displays a video playback error overlay when the video element errors", async () => {
    mockedAxios.get.mockResolvedValueOnce(mockPlaylistResponse);
    mockUseSearchParams.mockReturnValue(new URLSearchParams("?playlistId=playlist-1&videoIndex=0"));

    const { container } = render(<VideoDropCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "A Winning Strategy" })).toBeInTheDocument();
    });

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();

    if (video) {
      fireEvent.error(video);
    }

    await waitFor(() => {
      expect(screen.getByText(/Unable to play video/i)).toBeInTheDocument();
    });
  });
});
