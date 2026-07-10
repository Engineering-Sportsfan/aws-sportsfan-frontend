// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import axios from "axios";
// import LoginCard from "./page";

// //  Mock axios
// jest.mock("axios");
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// // Mock router
// const pushMock = jest.fn();

// jest.mock("next/navigation", () => ({
//   useRouter: () => ({
//     push: pushMock,
//   }),
// }));

// // Helper to create axios error
// const createAxiosError = (status: number, message?: string) => {
//   return {
//     isAxiosError: true,
//     response: {
//       status,
//       data: { error: message },
//     },
//   } as unknown as Error;
// };

// describe("LoginPage - Login Flow", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     pushMock.mockClear();
//   });

//   // ---------------- RENDER ----------------
//   it("should render login form correctly", () => {
//     render(<LoginCard />);

//     expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
//     expect(screen.getByText("Continue")).toBeInTheDocument();
//   });

//   // ---------------- VALIDATION ----------------
//   it("should show error if fields are empty", async () => {
//     render(<LoginCard />);

//     fireEvent.click(screen.getByText("Continue"));

//     expect(
//       screen.getByText("Please enter email & password")
//     ).toBeInTheDocument();
//   });

//   // ---------------- SUCCESS LOGIN ----------------
//   it("should login successfully and redirect", async () => {
//     mockedAxios.post.mockResolvedValueOnce({
//       data: { success: true },
//     });

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "john@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "Password123!" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(pushMock).toHaveBeenCalledWith("/MainModules/HomePage");
//     });
//   });

//   // ---------------- ERROR CASES ----------------

//   it("should show error for invalid credentials (401)", async () => {
//     mockedAxios.post.mockRejectedValueOnce(createAxiosError(401));

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "wrong@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "wrongpass" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(
//         screen.getByText(/invalid email or password/i)
//       ).toBeInTheDocument();
//     });
//   });

//   it("should show error if user not found (404)", async () => {
//     mockedAxios.post.mockRejectedValueOnce(createAxiosError(404));

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "nouser@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "Password123!" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(
//         screen.getByText(/no account found/i)
//       ).toBeInTheDocument();
//     });
//   });

//   it("should show custom error message from API (403)", async () => {
//     mockedAxios.post.mockRejectedValueOnce(
//       createAxiosError(403, "Please verify OTP first")
//     );

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "test@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "Password123!" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(
//         screen.getByText(/please verify otp first/i)
//       ).toBeInTheDocument();
//     });
//   });

//   it("should show server error (500)", async () => {
//     mockedAxios.post.mockRejectedValueOnce(createAxiosError(500));

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "test@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "Password123!" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(
//         screen.getByText(/server error/i)
//       ).toBeInTheDocument();
//     });
//   });

//   it("should handle network error", async () => {
//     mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

//     render(<LoginCard />);

//     fireEvent.change(screen.getByPlaceholderText("Email Address"), {
//       target: { value: "test@example.com" },
//     });

//     fireEvent.change(screen.getByPlaceholderText("Password"), {
//       target: { value: "Password123!" },
//     });

//     fireEvent.click(screen.getByText("Continue"));

//     await waitFor(() => {
//       expect(
//         screen.getByText(/unable to connect/i)
//       ).toBeInTheDocument();
//     });
//   });
// });






// app/auth/login/page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import LoginCard from "./page";
import { createMockAxiosError, createNetworkError } from "@/utils/test-utils";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock router
const pushMock = jest.fn();

// Mock useSearchParams BEFORE importing the component
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(), // Add this here
  usePathname: () => "",
}));

describe("LoginPage - Login Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
  });

  it("should render login form correctly", async () => {
    render(<LoginCard />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });
  });

  it("should show error if fields are empty", async () => {
    render(<LoginCard />);
    fireEvent.click(screen.getByText("Continue"));
    
    await waitFor(() => {
      expect(
        screen.getByText("Please enter email & password")
      ).toBeInTheDocument();
    });
  });

  it("should login successfully and redirect", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    render(<LoginCard />);

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/MainModules/HomePage");
    });
  });

  it("should show error for invalid credentials (401)", async () => {
    mockedAxios.post.mockRejectedValueOnce(createMockAxiosError(401, "Invalid credentials"));

    render(<LoginCard />);

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });

  it("should handle network error", async () => {
    mockedAxios.post.mockRejectedValueOnce(createNetworkError());

    render(<LoginCard />);

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByText("Continue"));

    await waitFor(() => {
      expect(
        screen.getByText(/unable to connect/i)
      ).toBeInTheDocument();
    });
  });
});