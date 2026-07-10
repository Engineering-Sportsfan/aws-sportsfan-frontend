import { fireEvent, render, screen } from "@testing-library/react";
import PerformanceOverview from "./index";

describe("PerformanceOverview", () => {
	it("renders dashboard heading and welcome message", () => {
		render(<PerformanceOverview />);

		expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getByText("Welcome back, Pullela")).toBeInTheDocument();
	});

	it("renders performance overview section heading", () => {
		render(<PerformanceOverview />);

		expect(
			screen.getByRole("heading", { name: "Performance Overview" })
		).toBeInTheDocument();
	});

	it("shows default period button label", () => {
		render(<PerformanceOverview />);

		expect(screen.getByRole("button", { name: "This Month" })).toBeInTheDocument();
	});

	it("toggles period from This Month to This Week and back", () => {
		render(<PerformanceOverview />);

		const periodButton = screen.getByRole("button", { name: "This Month" });
		fireEvent.click(periodButton);
		expect(screen.getByRole("button", { name: "This Week" })).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "This Week" }));
		expect(screen.getByRole("button", { name: "This Month" })).toBeInTheDocument();
	});

	it("renders all stat card labels", () => {
		render(<PerformanceOverview />);

		expect(screen.getByText("Total Viewers")).toBeInTheDocument();
		expect(screen.getByText("Total Earnings")).toBeInTheDocument();
		expect(screen.getByText("Performance Score")).toBeInTheDocument();
		expect(screen.getByText("Cards Issued")).toBeInTheDocument();
	});

	it("renders viewer and earnings values with formatting", () => {
		render(<PerformanceOverview />);

		expect(screen.getByText("8,420")).toBeInTheDocument();
		expect(screen.getByText("₹72,036")).toBeInTheDocument();
	});

	it("renders performance score and denominator", () => {
		render(<PerformanceOverview />);

		expect(screen.getByText("87")).toBeInTheDocument();
		expect(screen.getByText("/100")).toBeInTheDocument();
	});

	it("renders cards issued value and subtitle", () => {
		render(<PerformanceOverview />);

		expect(screen.getByText("1,204")).toBeInTheDocument();
		expect(screen.getByText("Across 47 rooms")).toBeInTheDocument();
	});

	it("renders growth badges", () => {
		render(<PerformanceOverview />);

		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(screen.getByText("+8%")).toBeInTheDocument();
	});

	it("renders expected total number of buttons", () => {
		render(<PerformanceOverview />);

		expect(screen.getAllByRole("button")).toHaveLength(3);
	});
});
