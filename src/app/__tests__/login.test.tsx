import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import LoginScreen from "../login";
import * as authService from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

jest.mock("@/services/authService");
jest.mock("@/context/AuthContext");
jest.mock("expo-router");
jest.mock("../../public/images/bear.svg", () => "BearIcon");

jest.spyOn(Alert, "alert");

const mockLogin = jest.fn();
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

const mockAuthLogin = jest.fn();

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockAuthLogin,
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  });

  it("renders all login form elements", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText("student@ucr.edu")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Sign Up with UCR EMAIL")).toBeTruthy();
    expect(getByText("R'ATE")).toBeTruthy();
    expect(getByText("Rate what you ate!")).toBeTruthy();
  });

  it("updates email input when user types", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");

    fireEvent.changeText(emailInput, "test@ucr.edu");

    expect(emailInput.props.value).toBe("test@ucr.edu");
  });

  it("updates password input when user types", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(passwordInput, "password123");

    expect(passwordInput.props.value).toBe("password123");
  });

  it("shows error alert when email is empty", async () => {
    const { getByText } = render(<LoginScreen />);
    const loginButton = getByText("Login");

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please enter both email and password"
      );
    });
  });

  it("shows error alert when password is empty", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please enter both email and password"
      );
    });
  });

  it("calls login service with correct credentials", async () => {
    const mockAuthResponse = {
      message: "Login successful",
      token: "test-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "Bronze",
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@ucr.edu",
        password: "password123",
      });
    });
  });

  it("updates auth context on successful login", async () => {
    const mockAuthResponse = {
      message: "Login successful",
      token: "test-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "Bronze",
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(mockAuthResponse.user);
    });
  });

  it("navigates to tabs on successful login", async () => {
    const mockAuthResponse = {
      message: "Login successful",
      token: "test-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "Bronze",
      },
    };

    (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("(tabs)");
    });
  });

  it("shows error alert on login failure", async () => {
    const errorMessage = "Invalid email or password";
    (authService.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "wrongpassword");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Login Failed", errorMessage);
    });
  });

  it("shows default error message when error has no message", async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error());

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Login Failed",
        "Invalid email or password. Please try again."
      );
    });
  });

  it("shows loading indicator during login", async () => {
    const mockAuthResponse = {
      message: "Login successful",
      token: "test-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "Test User",
        tier: "Bronze",
      },
    };

    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    (authService.login as jest.Mock).mockReturnValue(loginPromise);

    const { getByPlaceholderText, getByText, queryByText } = render(
      <LoginScreen />
    );
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(queryByText("Login")).toBeNull();
    });

    resolveLogin!(mockAuthResponse);

    await waitFor(() => {
      expect(queryByText("Login")).toBeTruthy();
    });
  });

  it("navigates to signup screen when signup button is pressed", () => {
    const { getByText } = render(<LoginScreen />);
    const signupButton = getByText("Sign Up with UCR EMAIL");

    fireEvent.press(signupButton);

    expect(mockRouter.push).toHaveBeenCalledWith("signup");
  });

  it("password input has secureTextEntry enabled", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Password");

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("email input has correct keyboard type", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");

    expect(emailInput.props.keyboardType).toBe("email-address");
    expect(emailInput.props.autoCapitalize).toBe("none");
  });
});
