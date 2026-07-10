import { fireEvent, render, screen } from "@testing-library/react";
import CreateRoomStep3 from "./index";

describe("CreateRoomStep3", () => {
	it("renders title bar and header content", () => {
		render(<CreateRoomStep3 />);

		expect(screen.getByText("CreateNewRoom")).toBeInTheDocument();
		expect(screen.getByText("Create New Room")).toBeInTheDocument();
		expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
	});

	it("renders custom current step when provided", () => {
		render(<CreateRoomStep3 currentStep={4} />);

		expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
	});

	it("renders step labels", () => {
		render(<CreateRoomStep3 />);

		expect(screen.getByText("Event")).toBeInTheDocument();
		expect(screen.getByText("Details")).toBeInTheDocument();
		expect(screen.getByText("Content")).toBeInTheDocument();
		expect(screen.getByText("Pricing & Review")).toBeInTheDocument();
	});

	it("renders content and media section", () => {
		render(<CreateRoomStep3 />);

		expect(screen.getByText("Content & Media")).toBeInTheDocument();
		expect(screen.getByText("Add Content Assets")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /browse files/i })).toBeInTheDocument();
	});

	it("renders footer action buttons", () => {
		render(<CreateRoomStep3 />);

		expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /save draft/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /next: continue/i })).toBeInTheDocument();
	});

	it("calls onPrev for both back and previous buttons", () => {
		const onPrev = jest.fn();
		render(<CreateRoomStep3 onPrev={onPrev} />);

		fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
		fireEvent.click(screen.getByRole("button", { name: /previous/i }));

		expect(onPrev).toHaveBeenCalledTimes(2);
	});

	it("calls onNext when next button is clicked", () => {
		const onNext = jest.fn();
		render(<CreateRoomStep3 onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /next: continue/i }));

		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("does not call handlers when save draft is clicked", () => {
		const onPrev = jest.fn();
		const onNext = jest.fn();
		render(<CreateRoomStep3 onPrev={onPrev} onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

		expect(onPrev).not.toHaveBeenCalled();
		expect(onNext).not.toHaveBeenCalled();
	});

	it("handles missing callback props without throwing", () => {
		render(<CreateRoomStep3 />);

		expect(() => {
			fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
			fireEvent.click(screen.getByRole("button", { name: /previous/i }));
			fireEvent.click(screen.getByRole("button", { name: /next: continue/i }));
		}).not.toThrow();
	});

	it("toggles upload zone drag style on drag events", () => {
		const { container } = render(<CreateRoomStep3 />);

		const uploadZone = container.querySelector("div.border-dashed") as HTMLElement;
		expect(uploadZone).toBeInTheDocument();
		expect(uploadZone.className).toContain("border-white/10");

		fireEvent.dragOver(uploadZone);
		expect(uploadZone.className).toContain("border-orange-500/60");

		fireEvent.dragLeave(uploadZone);
		expect(uploadZone.className).toContain("border-white/10");

		fireEvent.drop(uploadZone);
		expect(uploadZone.className).toContain("border-white/10");

		expect(container).toBeInTheDocument();
	});
});
