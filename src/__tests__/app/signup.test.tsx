import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { signup } from "@/services/authService";
import SignupScreen from "../../app/signup";

jest.mock("@/services/authService");
jest.mock("@/context/AuthContext");
jest.mock("expo-router");

describe("SignupScreen", () => {
  const mockReplace = jest.fn();
  const mockRouter = {
    push: jest.fn(),
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

  it("should render signup screen", () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    expect(getByText("R'ATE")).toBeTruthy();
    expect(getByPlaceholderText("John Doe")).toBeTruthy();
    expect(getByPlaceholderText("student@ucr.edu")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("should display all required elements", () => {
    const { getByText } = render(<SignupScreen />);
    expect(getByText("R'ATE")).toBeTruthy();
    expect(getByText("Join UCR's Foodie Community")).toBeTruthy();
    expect(getByText("Full Name")).toBeTruthy();
    expect(getByText("UCR Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("Confirm Password")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
    expect(getByText("Back to Login")).toBeTruthy();
  });

  it("should update name input", () => {
    const { getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    fireEvent.changeText(nameInput, "John Doe");
    expect(nameInput.props.value).toBe("John Doe");
  });

  it("should update email input", () => {
    const { getByPlaceholderText } = render(<SignupScreen />);
    const emailInput = getByPlaceholderText("student@ucr.edu");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    expect(emailInput.props.value).toBe("test@ucr.edu");
  });

  it("should update password inputs", () => {
    const { getByPlaceholderText } = render(<SignupScreen />);
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");

    expect(passwordInput.props.value).toBe("password123");
    expect(confirmPasswordInput.props.value).toBe("password123");
  });

  it("should show error when fields are empty", async () => {
    const { getByText } = render(<SignupScreen />);
    const signupButton = getByText("Sign Up");

    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please fill in all required fields",
      );
    });
    expect(signup).not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "differentpassword");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Passwords do not match",
      );
    });
    expect(signup).not.toHaveBeenCalled();
  });

  it("should show error when email is not UCR email", async () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@gmail.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please use a valid UCR email address",
      );
    });
    expect(signup).not.toHaveBeenCalled();
  });

  it("should accept valid UCR email", async () => {
    const mockResponse = {
      message: "User created successfully",
      token: "jwt-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "John Doe",
        tier: "bronze",
      },
    };

    (signup as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        email: "test@ucr.edu",
        password: "password123",
        name: "John Doe",
      });
    });
  });

  it("should call signup service with correct credentials", async () => {
    const mockResponse = {
      message: "User created successfully",
      token: "jwt-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "John Doe",
        tier: "bronze",
      },
    };

    (signup as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        email: "test@ucr.edu",
        password: "password123",
        name: "John Doe",
      });
    });
  });

  it("should update auth context and navigate on successful signup", async () => {
    const mockResponse = {
      message: "User created successfully",
      token: "jwt-token",
      user: {
        id: 1,
        email: "test@ucr.edu",
        name: "John Doe",
        tier: "bronze",
      },
    };

    (signup as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(mockResponse.user);
      expect(mockReplace).toHaveBeenCalledWith("(tabs)");
    });
  });

  it("should show error alert on signup failure", async () => {
    const error = new Error("User already exists");
    (signup as jest.Mock).mockRejectedValueOnce(error);

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText("John Doe");
    const emailInput = getByPlaceholderText("student@ucr.edu");
    const passwordInput = getByPlaceholderText("Password");
    const confirmPasswordInput = getByPlaceholderText("Confirm Password");
    const signupButton = getByText("Sign Up");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "test@ucr.edu");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Signup Failed",
        "User already exists",
      );
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should navigate back to login screen", () => {
    const { getByText } = render(<SignupScreen />);
    const backToLoginButton = getByText("Back to Login");

    fireEvent.press(backToLoginButton);

    expect(mockReplace).toHaveBeenCalledWith("login");
  });
});
