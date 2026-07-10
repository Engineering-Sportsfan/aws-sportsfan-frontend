import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import RegisterPage from "./page";

//  Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

//  Mock router
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));


// Helper to create axios error
const createAxiosError = (status: number, message?: string) => {
  return {
    isAxiosError: true,
    response: {
      status,
      data: { error: message },
    },
  } as unknown as Error;
};

describe("RegisterPage - Registration Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---------------- STEP 1 ----------------
  describe("Step 1: Registration Form", () => {
    it("should render registration form correctly", () => {
      render(<RegisterPage />);

      expect(screen.getByPlaceholderText("First Name*")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Last Name*")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });

    it("should proceed to OTP step on success", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      render(<RegisterPage />);

      fireEvent.change(screen.getByPlaceholderText("First Name*"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Last Name*"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email Address"), {
        target: { value: "john@example.com" },
      });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Enter the OTP")).toBeInTheDocument();
      });
    });

    it("should redirect if user exists (409)", async () => {
      mockedAxios.post.mockRejectedValueOnce(
        createAxiosError(409, "User already exists")
      );

      render(<RegisterPage />);

      fireEvent.change(screen.getByPlaceholderText("First Name*"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Last Name*"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email Address"), {
        target: { value: "existing@example.com" },
      });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(
          screen.getByText(/already registered/i)
        ).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      expect(pushMock).toHaveBeenCalledWith("/auth/login");
    });
  });

  // ---------------- STEP 2 ----------------
  describe("OTP Verification", () => {
    beforeEach(async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      render(<RegisterPage />);

      fireEvent.change(screen.getByPlaceholderText("First Name*"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Last Name*"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email Address"), {
        target: { value: "john@example.com" },
      });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Enter the OTP")).toBeInTheDocument();
      });
    });

    it("should verify OTP", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input, i) => {
        fireEvent.change(input, { target: { value: String(i + 1) } });
      });

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(
          screen.getByText("Set your password")
        ).toBeInTheDocument();
      });
    });
  });

  // ---------------- STEP 3 ----------------
  describe("Set Password", () => {
    beforeEach(async () => {
      mockedAxios.post
        .mockResolvedValueOnce({ data: { success: true } }) // register
        .mockResolvedValueOnce({ data: { success: true } }); // otp

      render(<RegisterPage />);

      fireEvent.change(screen.getByPlaceholderText("First Name*"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Last Name*"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email Address"), {
        target: { value: "john@example.com" },
      });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Enter the OTP")).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input, i) => {
        fireEvent.change(input, { target: { value: String(i + 1) } });
      });

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(screen.getByText("Set your password")).toBeInTheDocument();
      });
    });

    it("should redirect after password set", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "Password123!" },
      });

      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "Password123!" },
      });

      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith("/auth/login");
      });
    });
  });
});