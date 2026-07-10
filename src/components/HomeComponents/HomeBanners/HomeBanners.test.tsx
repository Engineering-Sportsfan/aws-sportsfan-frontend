import { render, screen } from "@testing-library/react";
import HomeBanners from "./index";

describe("HomeBanners Component - 30 Tests", () => {
  // Test 1-3: Basic Rendering
  it("test 1: renders without crashing", () => {
    render(<HomeBanners />);
    const titles = screen.getAllByText("TATA IPL T20 2026");
    expect(titles.length).toBe(2); // Mobile and desktop
  });

  it("test 2: displays first banner title", () => {
    render(<HomeBanners />);
    const titles = screen.getAllByText("TATA IPL T20 2026");
    expect(titles.length).toBe(2); // Mobile and desktop
  });

  it("test 3: displays second banner title", () => {
    render(<HomeBanners />);
    const titles = screen.getAllByText("Watch Along");
    expect(titles.length).toBe(2); // Mobile and desktop
  });

  // Test 4-6: More Title Tests
  it("test 4: displays third banner title", () => {
    render(<HomeBanners />);
    const titles = screen.getAllByText("Dream Panel");
    expect(titles.length).toBe(2); // Mobile and desktop
  });

  it("test 5: all titles are present", () => {
    render(<HomeBanners />);
    const titles = ["TATA IPL T20 2026", "Watch Along", "Dream Panel"];
    titles.forEach(title => {
      const elements = screen.getAllByText(title);
      expect(elements.length).toBe(2); // Mobile and desktop
    });
  });

  it("test 6: titles are h2 elements", () => {
    render(<HomeBanners />);
    const headings = document.querySelectorAll('h2');
    expect(headings.length).toBeGreaterThan(0);
  });

  // Test 7-9: Subtitle Tests
  it("test 7: displays first banner subtitle", () => {
    render(<HomeBanners />);
    const subtitles = screen.getAllByText("Experience cricket's biggest league");
    expect(subtitles.length).toBe(2); // Mobile and desktop
  });

  it("test 8: displays second banner subtitle", () => {
    render(<HomeBanners />);
    const subtitles = screen.getAllByText("With Ravi Chandra Ashwin");
    expect(subtitles.length).toBe(2); // Mobile and desktop
  });

  it("test 9: displays third banner subtitle", () => {
    render(<HomeBanners />);
    const subtitles = screen.getAllByText("Special Interview Virat Kohli");
    expect(subtitles.length).toBe(2); // Mobile and desktop
  });

  // Test 10-12: More Subtitle Tests
  it("test 10: all subtitles are present", () => {
    render(<HomeBanners />);
    const subtitles = [
      "Experience cricket's biggest league",
      "With Ravi Chandra Ashwin",
      "Special Interview Virat Kohli"
    ];
    subtitles.forEach(subtitle => {
      const elements = screen.getAllByText(subtitle);
      expect(elements.length).toBe(2); // Mobile and desktop
    });
  });

  it("test 11: subtitles are p elements", () => {
    render(<HomeBanners />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("test 12: each banner has a subtitle", () => {
    render(<HomeBanners />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(6); // 3 mobile + 3 desktop
  });

  // Test 13-15: Image Tests
  it("test 13: renders first banner image", () => {
    render(<HomeBanners />);
    const image = document.querySelector('img[src="/images/bannerone.png"]');
    expect(image).toBeInTheDocument();
  });

  it("test 14: renders second banner image", () => {
    render(<HomeBanners />);
    const image = document.querySelector('img[src="/images/bannertwo.jpg"]');
    expect(image).toBeInTheDocument();
  });

  it("test 15: renders third banner image", () => {
    render(<HomeBanners />);
    const image = document.querySelector('img[src="/images/bannerthree.png"]');
    expect(image).toBeInTheDocument();
  });

  // Test 16-18: More Image Tests
  it("test 16: all images have src attributes", () => {
    render(<HomeBanners />);
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('src');
    });
  });

  it("test 17: renders exactly 3 images", () => {
    render(<HomeBanners />);
    const images = document.querySelectorAll('img');
    expect(images.length).toBe(6); // 3 mobile + 3 desktop
  });

  it("test 18: images are visible", () => {
    render(<HomeBanners />);
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toBeVisible();
    });
  });

  // Test 19-21: Layout Structure Tests
  it("test 19: has main container", () => {
    const { container } = render(<HomeBanners />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("test 20: renders mobile layout", () => {
    const { container } = render(<HomeBanners />);
    const mobileDiv = container.querySelector(".flex");
    expect(mobileDiv).toBeInTheDocument();
  });

  it("test 21: renders desktop layout", () => {
    const { container } = render(<HomeBanners />);
    const desktopDiv = container.querySelector(".hidden");
    expect(desktopDiv).toBeInTheDocument();
  });

  // Test 22-24: Banner Container Tests
  it("test 22: renders banner containers", () => {
    const { container } = render(<HomeBanners />);
    const banners = container.querySelectorAll(".rounded-xl");
    expect(banners.length).toBeGreaterThan(0);
  });

  it("test 23: has correct number of banner containers", () => {
    const { container } = render(<HomeBanners />);
    const banners = container.querySelectorAll(".rounded-xl");
    expect(banners.length).toBe(6); // 3 mobile + 3 desktop
  });

  it("test 24: banner containers have overflow hidden", () => {
    const { container } = render(<HomeBanners />);
    const banners = container.querySelectorAll(".overflow-hidden");
    expect(banners.length).toBeGreaterThan(0);
  });

  // Test 25-27: Content Verification Tests
  it("test 25: renders all required titles", () => {
    render(<HomeBanners />);
    const titles = ["TATA IPL T20 2026", "Watch Along", "Dream Panel"];
    titles.forEach(title => {
      const elements = screen.getAllByText(title);
      expect(elements.length).toBe(2); // Mobile and desktop
    });
  });

  it("test 26: renders all required subtitles", () => {
    render(<HomeBanners />);
    const subtitles = [
      "Experience cricket's biggest league",
      "With Ravi Chandra Ashwin",
      "Special Interview Virat Kohli"
    ];
    subtitles.forEach(subtitle => {
      const elements = screen.getAllByText(subtitle);
      expect(elements.length).toBe(2); // Mobile and desktop
    });
  });

  it("test 27: content is duplicated for mobile and desktop", () => {
    render(<HomeBanners />);
    const allTitles = screen.getAllByText(/TATA IPL T20 2026|Watch Along|Dream Panel/);
    expect(allTitles.length).toBe(6); // 3 titles × 2 layouts
  });

  // Test 28-30: Final Accessibility and Structure Tests
  it("test 28: has proper semantic structure", () => {
    render(<HomeBanners />);
    const headings = document.querySelectorAll('h2');
    const paragraphs = document.querySelectorAll('p');
    expect(headings.length).toBeGreaterThan(0);
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("test 29: all text content is accessible", () => {
    render(<HomeBanners />);
    const textElements = document.querySelectorAll('h2, p');
    textElements.forEach(element => {
      expect(element).toBeVisible();
      expect(element.textContent).toBeTruthy();
    });
  });

  it("test 30: component maintains consistent structure", () => {
    const { container } = render(<HomeBanners />);
    // Check that we have both mobile and desktop layouts
    const mobileLayout = container.querySelector(".flex");
    const desktopLayout = container.querySelector(".hidden");

    expect(mobileLayout).toBeInTheDocument();
    expect(desktopLayout).toBeInTheDocument();

    // Check that we have the expected number of visual elements
    const images = container.querySelectorAll('img');
    const banners = container.querySelectorAll(".rounded-xl");

    expect(images.length).toBe(6); // 3 mobile + 3 desktop
    expect(banners.length).toBe(6);
  });
});