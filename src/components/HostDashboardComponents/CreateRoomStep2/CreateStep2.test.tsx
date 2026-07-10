import { fireEvent, render, screen, within } from "@testing-library/react";
import CreateRoomStep2 from "./index";

describe("CreateRoomStep2", () => {
	it("renders header and default step indicator", () => {
		render(<CreateRoomStep2 />);

		expect(screen.getByText("Create New Room")).toBeInTheDocument();
		expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
		expect(screen.getByText("Room Details")).toBeInTheDocument();
	});

	it("renders custom current step when provided", () => {
		render(<CreateRoomStep2 currentStep={3} />);

		expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
	});

	it("renders default room title value and character counter", () => {
		render(<CreateRoomStep2 />);

		const titleInput = screen.getByPlaceholderText("Enter room title...") as HTMLInputElement;
		expect(titleInput.value).toContain("Gopichand's Tactical Breakdown");
		expect(screen.getByText(/\d+ \/ 60 characters/)).toBeInTheDocument();
	});

	it("updates room title and enforces max length 60", () => {
		render(<CreateRoomStep2 />);

		const titleInput = screen.getByPlaceholderText("Enter room title...") as HTMLInputElement;
		const longText = "a".repeat(80);

		fireEvent.change(titleInput, { target: { value: longText } });

		expect(titleInput.value.length).toBe(60);
		expect(screen.getByText("60 / 60 characters")).toBeInTheDocument();
	});

	it("updates description and enforces max length 200", () => {
		render(<CreateRoomStep2 />);

		const description = screen.getByPlaceholderText(
			"Describe what fans can expect from this room..."
		) as HTMLTextAreaElement;
		const longDescription = "b".repeat(230);

		fireEvent.change(description, { target: { value: longDescription } });

		expect(description.value.length).toBe(200);
		expect(screen.getByText("200 / 200 characters")).toBeInTheDocument();
	});

	it("removes a category tag when close button is clicked", () => {
		render(<CreateRoomStep2 />);

		const tagText = screen.getByText("Fan Energy");
		const tagChip = tagText.closest("span") as HTMLElement;
		const removeButton = within(tagChip).getByRole("button");

		fireEvent.click(removeButton);

		expect(screen.queryByText("Fan Energy")).not.toBeInTheDocument();
	});

	it("renders add tag and upload controls", () => {
		render(<CreateRoomStep2 />);

		expect(screen.getByRole("button", { name: /\+ add tag/i })).toBeInTheDocument();
		expect(screen.getByText("Upload Image")).toBeInTheDocument();
		expect(screen.getByText(/PNG, JPG up to 5MB/i)).toBeInTheDocument();
	});

	it("renders select placeholders for capacity and language", () => {
		render(<CreateRoomStep2 />);

		expect(screen.getByText("Select capacity")).toBeInTheDocument();
		expect(screen.getByText("Select language")).toBeInTheDocument();
	});

	it("calls onPrev from both back and previous buttons", () => {
		const onPrev = jest.fn();
		render(<CreateRoomStep2 onPrev={onPrev} />);

		fireEvent.click(screen.getByRole("button", { name: /^back$/i }));
		fireEvent.click(screen.getByRole("button", { name: /previous/i }));

		expect(onPrev).toHaveBeenCalledTimes(2);
	});

	it("calls onNext from next button", () => {
		const onNext = jest.fn();
		render(<CreateRoomStep2 onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /next: continue/i }));

		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("does not call handlers when save draft is clicked", () => {
		const onPrev = jest.fn();
		const onNext = jest.fn();
		render(<CreateRoomStep2 onPrev={onPrev} onNext={onNext} />);

		fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

		expect(onPrev).not.toHaveBeenCalled();
		expect(onNext).not.toHaveBeenCalled();
	});
});
