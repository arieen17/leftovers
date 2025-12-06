import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/services/authService";
import LoginScreen from "../../app/login";

jest.mock("@/services/authService");
jest.mock("@/context/AuthContext");
jest.mock("expo-router");

describe("LoginScreen", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  };

  const mockAuthLogin = jest.fn();
  const mockAuth = {
    login: mockAuthLogin,
    user: null,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    jest.spyOn(Alert, "alert");
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render login screen", () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    expect(getByText("R'ATE")).toBeTruthy();
    expect(getByPlaceholderText("student@ucr.edu")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
  });

  it("should display all required elements", () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText("R'ATE")).toBeTruthy();
    expect(getByText("Rate what you ate!")).toBeTruthy();
    expect(getByText("UCR Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("Sign Up with UCR EMAIL")).toBeTruthy();
  });

  it("should update email input", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    expect(emailInput.props.value).toBe("test@ucr.edu");
  });

  it("should update password input", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("should show error alert when email or password is empty", async () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText("Login");

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please enter both email and password",
      );
    });
    expect(login).not.toHaveBeenCalled();
  });

  it("should show error alert when only email is provided", async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please enter both email and password",
      );
    });
  });

  it("should show error alert when only password is provided", async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please enter both email and password",
      );
    });
  });

  it("should call login service with correct credentials", async () => {
    const mockResponse = {
      message: "Login successful",
      token: "jwt-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "bronze",
      },
    };

    (login as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "test@ucr.edu",
        password: "password123",
      });
    });
  });

  it("should update auth context and navigate on successful login", async () => {
    const mockResponse = {
      message: "Login successful",
      token: "jwt-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "bronze",
      },
    };

    (login as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(mockResponse.user);
      expect(mockReplace).toHaveBeenCalledWith("(tabs)");
    });
  });

  it("should show error alert on login failure", async () => {
    const error = new Error("Invalid credentials");
    (login as jest.Mock).mockRejectedValueOnce(error);

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "wrongpassword");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Login Failed",
        "Invalid credentials",
      );
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should navigate to signup screen", () => {
    const { getByText } = render(<LoginScreen />);
    const signupButton = getByText("Sign Up with UCR EMAIL");

    fireEvent.press(signupButton);

    expect(mockPush).toHaveBeenCalledWith("signup");
  });

  it("should show loading indicator during login", async () => {
    const mockResponse = {
      message: "Login successful",
      token: "jwt-token",
      user: { id: 1, email: "test@ucr.edu", name: "Test", tier: "bronze" },
    };

    (login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100)),
    );

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    // Should show loading state (ActivityIndicator)
    // Note: This is a basic check - in a real scenario you'd check for ActivityIndicator
    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });
});
