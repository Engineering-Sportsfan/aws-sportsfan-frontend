import { fireEvent, render, screen } from "@testing-library/react";
import LiveRoomsCard from "./index";

describe("LiveRoomsCard", () => {
	it("renders section header and view all action", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByRole("heading", { name: /live & upcoming rooms/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /view all/i })).toBeInTheDocument();
	});

	it("renders one live room card and one scheduled room card", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByText("Live")).toBeInTheDocument();
		expect(screen.getByText("Scheduled")).toBeInTheDocument();
	});

	it("renders live room title, tags and room type", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByText("Ind vs SA Tactical Breakdown")).toBeInTheDocument();
		expect(screen.getByText(/BWF World Tour Finals • Expert Analysis • Hindi/)).toBeInTheDocument();
		expect(screen.getByText("Open Room")).toBeInTheDocument();
	});

	it("renders scheduled room title, timing and room type", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByText("India vs China Semi-Final Watch Along")).toBeInTheDocument();
		expect(screen.getByText(/6:30 PM IST • Full Energy • Hindi/)).toBeInTheDocument();
		expect(screen.getByText("Inner Room")).toBeInTheDocument();
	});

	it("renders live room stats and formatted earnings", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByText("1,356 watching")).toBeInTheDocument();
		expect(screen.getByText("817 active")).toBeInTheDocument();
		expect(screen.getByText("34 min live")).toBeInTheDocument();
		expect(screen.getByText("₹42,196")).toBeInTheDocument();
	});

	it("renders scheduled room capacity and RSVP metrics", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByText("Capacity: 1,000")).toBeInTheDocument();
		expect(screen.getByText("342 RSVPs")).toBeInTheDocument();
	});

	it("renders scheduled room action buttons", () => {
		render(<LiveRoomsCard />);

		expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /go live early/i })).toBeInTheDocument();
	});

	it("renders menu buttons for both cards", () => {
		render(<LiveRoomsCard />);

		const menuButtons = screen.getAllByRole("button").filter((btn) => btn.textContent?.trim() === "");
		expect(menuButtons.length).toBe(2);
	});

	it("keeps content visible after clicking static action buttons", () => {
		render(<LiveRoomsCard />);

		fireEvent.click(screen.getByRole("button", { name: /view all/i }));
		fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
		fireEvent.click(screen.getByRole("button", { name: /go live early/i }));

		expect(screen.getByText("Ind vs SA Tactical Breakdown")).toBeInTheDocument();
		expect(screen.getByText("India vs China Semi-Final Watch Along")).toBeInTheDocument();
	});

	it("renders expected total number of buttons", () => {
		render(<LiveRoomsCard />);

		expect(screen.getAllByRole("button")).toHaveLength(5);
	});
});
