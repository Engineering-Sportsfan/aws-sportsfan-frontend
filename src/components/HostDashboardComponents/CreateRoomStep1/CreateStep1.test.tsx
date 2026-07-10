import { fireEvent, render, screen } from "@testing-library/react";
import CreateRoomStep1 from "./index";

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

describe("CreateRoomStep1", () => {
	it("renders header content and default step state", () => {
		render(<CreateRoomStep1 />);

		expect(screen.getByText("Create New Room")).toBeInTheDocument();
		expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
		expect(screen.getByText("Select Event")).toBeInTheDocument();
		expect(
			screen.getByText(
				"BWF World Tour Finals - India vs Denmark - Glasgow 2026"
			)
		).toBeInTheDocument();
	});

	it("calls onPrev and onNext when footer buttons are clicked", () => {
		const onPrev = jest.fn();
		const onNext = jest.fn();

		render(<CreateRoomStep1 onPrev={onPrev} onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /previous/i }));
		fireEvent.click(screen.getByRole("button", { name: /next: continue/i }));

		expect(onPrev).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("shows selected room type and updates selection on click", () => {
		render(<CreateRoomStep1 />);

		const openRoomButton = screen.getByRole("button", { name: /open room/i });
		const innerRoomButton = screen.getByRole("button", {
			name: /inner room/i,
		});

		expect(openRoomButton.className).toContain("border-orange-500");
		expect(innerRoomButton.className).not.toContain("border-orange-500");

		fireEvent.click(innerRoomButton);

		expect(innerRoomButton.className).toContain("border-orange-500");
		expect(openRoomButton.className).not.toContain("border-orange-500");
	});

	it("renders custom current step when provided", () => {
		render(<CreateRoomStep1 currentStep={3} />);

		expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
	});

	it("renders back link with expected dashboard route", () => {
		render(<CreateRoomStep1 />);

		const backLink = screen.getByRole("link", { name: /back/i });
		expect(backLink).toHaveAttribute("href", "/MainModules/HostDashboard");
	});

	it("renders all room type cards and badges", () => {
		render(<CreateRoomStep1 />);

		expect(screen.getByRole("button", { name: /open room/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /inner room/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /moment room/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /reflection room/i })).toBeInTheDocument();
		expect(screen.getByText("FREE")).toBeInTheDocument();
		expect(screen.getByText("PREMIUM")).toBeInTheDocument();
		expect(screen.getByText("LIMITED")).toBeInTheDocument();
		expect(screen.getByText("ARCHIVE")).toBeInTheDocument();
	});

	it("shows step indicator labels", () => {
		render(<CreateRoomStep1 />);

		expect(screen.getByText("Event")).toBeInTheDocument();
		expect(screen.getByText("Details")).toBeInTheDocument();
		expect(screen.getByText("Content")).toBeInTheDocument();
		expect(screen.getByText("Pricing & Review")).toBeInTheDocument();
	});

	it("renders footer action buttons", () => {
		render(<CreateRoomStep1 />);

		expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /save draft/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /next: continue/i })).toBeInTheDocument();
	});

	it("does not call navigation handlers when save draft is clicked", () => {
		const onPrev = jest.fn();
		const onNext = jest.fn();

		render(<CreateRoomStep1 onPrev={onPrev} onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

		expect(onPrev).not.toHaveBeenCalled();
		expect(onNext).not.toHaveBeenCalled();
	});

	it("does not throw when previous and next handlers are not provided", () => {
		render(<CreateRoomStep1 />);

		expect(() => {
			fireEvent.click(screen.getByRole("button", { name: /previous/i }));
			fireEvent.click(screen.getByRole("button", { name: /next: continue/i }));
		}).not.toThrow();
	});

	it("updates selected room when switching from open to moment", () => {
		render(<CreateRoomStep1 />);

		const openRoomButton = screen.getByRole("button", { name: /open room/i });
		const momentRoomButton = screen.getByRole("button", { name: /moment room/i });

		fireEvent.click(momentRoomButton);

		expect(momentRoomButton.className).toContain("border-orange-500");
		expect(openRoomButton.className).not.toContain("border-orange-500");
	});
});
