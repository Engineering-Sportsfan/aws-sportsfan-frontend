import { fireEvent, render, screen } from "@testing-library/react";
import RecentActivity from "./index";

jest.mock("next/link", () => {
	return function MockLink({
		children,
		href,
		...rest
	}: {
		children: React.ReactNode;
		href: string;
	}) {
		return (
			<a href={href} {...rest}>
				{children}
			</a>
		);
	};
});

describe("RecentActivity", () => {
	it("renders section heading", () => {
		render(<RecentActivity />);

		expect(
			screen.getByRole("heading", { name: "Recent Activity" })
		).toBeInTheDocument();
	});

	it("renders all activity titles", () => {
		render(<RecentActivity />);

		expect(screen.getByText("Elite Host Badge Earned")).toBeInTheDocument();
		expect(screen.getByText("Moderation Alert")).toBeInTheDocument();
		expect(screen.getByText("Revenue Milestone")).toBeInTheDocument();
	});

	it("renders all activity descriptions", () => {
		render(<RecentActivity />);

		expect(
			screen.getByText("Congratulations on your achievement!")
		).toBeInTheDocument();
		expect(screen.getByText("1 message flagged in Room #47")).toBeInTheDocument();
		expect(screen.getByText("Crossed ₹50,000 this month")).toBeInTheDocument();
	});

	it("renders all activity times", () => {
		render(<RecentActivity />);

		expect(screen.getByText("Just now")).toBeInTheDocument();
		expect(screen.getByText("2 min ago")).toBeInTheDocument();
		expect(screen.getByText("1 hour ago")).toBeInTheDocument();
	});

	it("renders exactly three activity cards", () => {
		const { container } = render(<RecentActivity />);

		const cards = container.querySelectorAll("div.rounded-2xl.p-4");
		expect(cards).toHaveLength(3);
	});

	it("applies highlighted styling on the top activity", () => {
		render(<RecentActivity />);

		const title = screen.getByText("Elite Host Badge Earned");
		const highlightedCard = title.closest("div")?.parentElement as HTMLElement;

		expect(highlightedCard.className).toContain("from-red-950/80");
		expect(highlightedCard.className).toContain("border-red-800/40");
	});

	it("renders create room call-to-action button", () => {
		render(<RecentActivity />);

		expect(
			screen.getByRole("button", { name: /create new room/i })
		).toBeInTheDocument();
	});

	it("renders link for create room with expected route", () => {
		render(<RecentActivity />);

		const createRoomLink = screen.getByRole("link", { name: /create new room/i });
		expect(createRoomLink).toHaveAttribute(
			"href",
			"/MainModules/HostDashboard/CreateRoomContent"
		);
	});

	it("keeps UI visible after clicking create room button", () => {
		render(<RecentActivity />);

		fireEvent.click(screen.getByRole("button", { name: /create new room/i }));

		expect(screen.getByText("Recent Activity")).toBeInTheDocument();
		expect(screen.getByText("Revenue Milestone")).toBeInTheDocument();
	});

	it("renders expected interactive element counts", () => {
		render(<RecentActivity />);

		expect(screen.getAllByRole("button")).toHaveLength(1);
		expect(screen.getAllByRole("link")).toHaveLength(1);
	});
});
