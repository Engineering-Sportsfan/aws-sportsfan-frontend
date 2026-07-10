import { fireEvent, render, screen } from "@testing-library/react";
import CreateRoomStep4 from "./index";

describe("CreateRoomStep4", () => {
	it("renders header and default step", () => {
		render(<CreateRoomStep4 />);

		expect(screen.getByText("Create New Room")).toBeInTheDocument();
		expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Pricing & Review" })
		).toBeInTheDocument();
	});

	it("renders custom current step when provided", () => {
		render(<CreateRoomStep4 currentStep={2} />);

		expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Details" })).toBeInTheDocument();
	});

	it("renders room preview mock content", () => {
		render(<CreateRoomStep4 />);

		expect(screen.getByText("LIVE")).toBeInTheDocument();
		expect(screen.getByText("Open Room")).toBeInTheDocument();
		expect(
			screen.getByText("Gopichand's Tactical Breakdown - India vs Denmark")
		).toBeInTheDocument();
		expect(screen.getByText(/BWF World Tour Finals/)).toBeInTheDocument();
		expect(screen.getByText("Subscribe & Enter")).toBeInTheDocument();
	});

	it("shows default price and earnings", () => {
		render(<CreateRoomStep4 />);

		const priceInput = screen.getByRole("spinbutton") as HTMLInputElement;
		expect(priceInput.value).toBe("49");
		expect(screen.getByText("₹29,400 – ₹39,200")).toBeInTheDocument();
	});

	it("clamps price to max value when user enters above range", () => {
		render(<CreateRoomStep4 />);

		const priceInput = screen.getByRole("spinbutton") as HTMLInputElement;
		fireEvent.change(priceInput, { target: { value: "120" } });

		expect(priceInput.value).toBe("99");
		expect(screen.getByText("₹59,400 – ₹79,200")).toBeInTheDocument();
	});

	it("clamps price to min value when user enters below range", () => {
		render(<CreateRoomStep4 />);

		const priceInput = screen.getByRole("spinbutton") as HTMLInputElement;
		fireEvent.change(priceInput, { target: { value: "1" } });

		expect(priceInput.value).toBe("29");
		expect(screen.getByText("₹17,400 – ₹23,200")).toBeInTheDocument();
	});

	it("calls onPrev from both Back and Previous buttons", () => {
		const onPrev = jest.fn();
		render(<CreateRoomStep4 onPrev={onPrev} />);

		fireEvent.click(screen.getByRole("button", { name: /back/i }));
		fireEvent.click(screen.getByRole("button", { name: /previous/i }));

		expect(onPrev).toHaveBeenCalledTimes(2);
	});

	it("calls onNext when publish room button is clicked", () => {
		const onNext = jest.fn();
		render(<CreateRoomStep4 onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /publish room/i }));

		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("does not call handlers when save draft is clicked", () => {
		const onPrev = jest.fn();
		const onNext = jest.fn();
		render(<CreateRoomStep4 onPrev={onPrev} onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

		expect(onPrev).not.toHaveBeenCalled();
		expect(onNext).not.toHaveBeenCalled();
	});

	it("handles missing callback props without throwing", () => {
		render(<CreateRoomStep4 />);

		expect(() => {
			fireEvent.click(screen.getByRole("button", { name: /back/i }));
			fireEvent.click(screen.getByRole("button", { name: /previous/i }));
			fireEvent.click(screen.getByRole("button", { name: /publish room/i }));
		}).not.toThrow();
	});
});
