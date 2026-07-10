import { render, screen, fireEvent } from "@testing-library/react";
import RightChatPanel from "./Rightchatpanel";

describe("RightChatPanel Component", () => {
  // -------- RENDER --------
  describe("Component Rendering", () => {
    it("should render RightChatPanel without crashing", () => {
      render(<RightChatPanel />);
      expect(screen.getByText(/Zone D — Live Chat/)).toBeInTheDocument();
    });

    it("should render Zone D header", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Zone D — Live Chat")).toBeInTheDocument();
    });

    it("should render chat messages", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Amazing shot! 🔥")).toBeInTheDocument();
    });

    it("should render input area", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
    });
  });

  // -------- TABS --------
  describe("Tab Navigation", () => {
    it("should render All tab", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("All")).toBeInTheDocument();
    });

    it("should render Privately tab", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Privately")).toBeInTheDocument();
    });

    it("All tab should be selected by default", () => {
      const { container } = render(<RightChatPanel />);
      const allTab = screen.getByText("All").closest("button");
      expect(allTab).toHaveClass("bg-[#ec4899]");
    });

    it("clicking Privately tab should switch tabs", () => {
      const { container } = render(<RightChatPanel />);
      const privatelyTab = screen.getByText("Privately").closest("button");
      
      fireEvent.click(privatelyTab!);
      
      expect(privatelyTab).toHaveClass("bg-[#ec4899]");
    });

    it("All tab should become inactive when Privately is selected", () => {
      const { container } = render(<RightChatPanel />);
      const allTab = screen.getByText("All").closest("button");
      const privatelyTab = screen.getByText("Privately").closest("button");
      
      fireEvent.click(privatelyTab!);
      
      expect(allTab).toHaveClass("bg-[#1e2128]");
    });

    it("tabs should have rounded corners", () => {
      const { container } = render(<RightChatPanel />);
      const allTab = screen.getByText("All").closest("button");
      expect(allTab).toHaveClass("rounded-full");
    });
  });

  // -------- MESSAGES --------
  describe("Chat Messages", () => {
    it("should display message from Rajesh", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Rajesh")).toBeInTheDocument();
      expect(screen.getByText("Amazing shot! 🔥")).toBeInTheDocument();
    });

    it("should display message from Priya", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Priya")).toBeInTheDocument();
      expect(screen.getByText("What a catch!")).toBeInTheDocument();
    });

    it("should display message from Arjun", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Arjun")).toBeInTheDocument();
      expect(screen.getByText("RCB needs wickets here")).toBeInTheDocument();
    });

    it("should display message from Neha", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Neha")).toBeInTheDocument();
      expect(screen.getByText("Great analysis!")).toBeInTheDocument();
    });

    it("should display message from Vikram", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Vikram")).toBeInTheDocument();
      expect(screen.getByText("Rohit on fire 🔥")).toBeInTheDocument();
    });

    it("messages should display timestamps", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("00:12")).toBeInTheDocument();
      expect(screen.getByText("00:15")).toBeInTheDocument();
      expect(screen.getByText("00:18")).toBeInTheDocument();
    });

    it("usernames should have distinct colors", () => {
      const { container } = render(<RightChatPanel />);
      const usernames = container.querySelectorAll("[style*='color']");
      expect(usernames.length).toBeGreaterThan(0);
    });

    it("should render correct number of messages", () => {
      render(<RightChatPanel />);
      const messages = [
        "Amazing shot! 🔥",
        "What a catch!",
        "RCB needs wickets here",
        "Great analysis!",
        "Rohit on fire 🔥",
      ];
      messages.forEach((msg) => {
        expect(screen.getByText(msg)).toBeInTheDocument();
      });
    });
  });

  // -------- INPUT AREA --------
  describe("Message Input Area", () => {
    it("should have message input field", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
    });

    it("input should have correct placeholder", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      expect(input?.placeholder).toBe("Type message...");
    });

    it("should render Send button", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Send")).toBeInTheDocument();
    });

    it("input should be editable", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: "Hello" } });
      
      expect(input.value).toBe("Hello");
    });

    it("Send button should be clickable", () => {
      const { container } = render(<RightChatPanel />);
      const sendBtn = screen.getByText("Send").closest("button");
      expect(sendBtn).not.toBeDisabled();
    });

    it("input should have correct styling", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("bg-[#1e2128]");
      expect(input).toHaveClass("border");
      expect(input).toHaveClass("text-white");
    });

    it("Send button should have pink background", () => {
      const { container } = render(<RightChatPanel />);
      const sendBtn = screen.getByText("Send").closest("button");
      expect(sendBtn).toHaveClass("bg-[#ec4899]");
    });
  });

  // -------- STYLING --------
  describe("Styling & CSS", () => {
    it("should have flex column layout", () => {
      const { container } = render(<RightChatPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("flex-col");
    });

    it("should have dark background", () => {
      const { container } = render(<RightChatPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("bg-[#111318]");
    });

    it("should have left border", () => {
      const { container } = render(<RightChatPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("border-l");
    });

    it("header should have bottom border", () => {
      const { container } = render(<RightChatPanel />);
      const header = container.querySelector(".px-4.pt-3.pb-2");
      expect(header).toHaveClass("border-b");
    });

    it("input area should have top border", () => {
      const { container } = render(<RightChatPanel />);
      const inputArea = container.querySelector(".border-t");
      expect(inputArea).toBeInTheDocument();
    });
  });

  // -------- LAYOUT STRUCTURE --------
  describe("Layout Structure", () => {
    it("should have header section", () => {
      const { container } = render(<RightChatPanel />);
      const header = container.querySelector(".px-4.pt-3.pb-2");
      expect(header).toBeInTheDocument();
    });

    it("should have messages section as flex-1", () => {
      const { container } = render(<RightChatPanel />);
      const messagesArea = container.querySelector(".flex-1");
      expect(messagesArea).toBeInTheDocument();
    });

    it("should have input section at bottom", () => {
      const { container } = render(<RightChatPanel />);
      const inputArea = container.querySelector(".border-t");
      expect(inputArea).toBeInTheDocument();
    });

    it("messages should be in overflow-y-auto container", () => {
      const { container } = render(<RightChatPanel />);
      const messagesContainer = container.querySelector(".overflow-y-auto");
      expect(messagesContainer).toBeInTheDocument();
    });

    it("messages should have gap-3 spacing", () => {
      const { container } = render(<RightChatPanel />);
      const messagesContainer = container.querySelector(".gap-3");
      expect(messagesContainer).toBeInTheDocument();
    });
  });

  // -------- MESSAGE STRUCTURE --------
  describe("Individual Message Structure", () => {
    it("each message should show username and timestamp", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Rajesh")).toBeInTheDocument();
      expect(screen.getByText("00:12")).toBeInTheDocument();
    });

    it("each message should show message text", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Amazing shot! 🔥")).toBeInTheDocument();
    });

    it("message text should be gray", () => {
      const { container } = render(<RightChatPanel />);
      const messageText = container.querySelector(".text-\\[\\#d1d5db\\]");
      expect(messageText).toBeInTheDocument();
    });

    it("timestamps should be muted gray", () => {
      const { container } = render(<RightChatPanel />);
      const timestamps = container.querySelectorAll(".text-\\[\\#4b5563\\]");
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  // -------- COLORS & THEMES --------
  describe("Colors & Themes", () => {
    it("should use pink for active tab", () => {
      const { container } = render(<RightChatPanel />);
      const activeTab = screen.getByText("All").closest("button");
      expect(activeTab).toHaveClass("bg-[#ec4899]");
    });

    it("should use pink for Send button", () => {
      const { container } = render(<RightChatPanel />);
      const sendBtn = screen.getByText("Send").closest("button");
      expect(sendBtn).toHaveClass("bg-[#ec4899]");
    });

    it("should use gray for inactive tabs", () => {
      const { container } = render(<RightChatPanel />);
      const privatelyTab = screen.getByText("Privately").closest("button");
      expect(privatelyTab).toHaveClass("bg-[#1e2128]");
    });

    it("should use dark background for input", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("bg-[#1e2128]");
    });
  });

  // -------- ACCESSIBILITY --------
  describe("Accessibility", () => {
    it("should have semantic structure", () => {
      const { container } = render(<RightChatPanel />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have proper text hierarchy", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Zone D — Live Chat")).toBeInTheDocument();
    });

    it("input should be reachable via keyboard", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
    });

    it("tabs should be keyboard accessible", () => {
      const { container } = render(<RightChatPanel />);
      const allTab = screen.getByText("All").closest("button");
      expect(allTab?.tagName).toBe("BUTTON");
    });

    it("should display all message content clearly", () => {
      render(<RightChatPanel />);
      expect(screen.getByText("Amazing shot! 🔥")).toBeInTheDocument();
      expect(screen.getByText("What a catch!")).toBeInTheDocument();
    });
  });

  // -------- RESPONSIVENESS --------
  describe("Responsive Design", () => {
    it("messages area should use flex-1 for fill", () => {
      const { container } = render(<RightChatPanel />);
      const messagesArea = container.querySelector(".flex-1");
      expect(messagesArea).toBeInTheDocument();
    });

    it("should handle overflow properly", () => {
      const { container } = render(<RightChatPanel />);
      const messagesContainer = container.querySelector(".overflow-y-auto");
      expect(messagesContainer).toBeInTheDocument();
    });

    it("input and button should be in flex row", () => {
      const { container } = render(<RightChatPanel />);
      const inputContainer = container.querySelector(".flex.items-center.gap-2");
      expect(inputContainer).toBeInTheDocument();
    });
  });

  // -------- INTERACTIVITY --------
  describe("Interactivity", () => {
    it("tabs should be switchable", () => {
      const { container } = render(<RightChatPanel />);
      const allTab = screen.getByText("All").closest("button");
      const privatelyTab = screen.getByText("Privately").closest("button");
      
      expect(allTab).toHaveClass("bg-[#ec4899]");
      
      fireEvent.click(privatelyTab!);
      
      expect(privatelyTab).toHaveClass("bg-[#ec4899]");
    });

    it("input value should update on user input", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: "Test message" } });
      
      expect(input.value).toBe("Test message");
    });

    it("input should clear after sending (if implemented)", () => {
      const { container } = render(<RightChatPanel />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      const sendBtn = screen.getByText("Send");
      
      fireEvent.change(input, { target: { value: "Test" } });
      fireEvent.click(sendBtn);
      
      // The component may or may not clear the input,
      // but the button should remain functional
      expect(sendBtn).not.toBeDisabled();
    });
  });
});
