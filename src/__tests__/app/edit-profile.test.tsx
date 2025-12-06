import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import EditProfileScreen from "../../app/edit-profile";

jest.mock("expo-router");
jest.mock("@/context/AuthContext");

describe("EditProfileScreen", () => {
  const mockBack = jest.fn();
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: mockBack,
  };

  const mockUser = {
    id: 1,
    email: "test@ucr.edu",
    name: "Test User",
    tier: "bronze",
    birthday: "1990-01-01",
    phone_number: "1234567890",
    address: "123 Test St",
  };

  const mockAuth = {
    user: mockUser,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  it("should render edit profile screen", () => {
    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("Profile Information")).toBeTruthy();
    expect(getByText("NAME")).toBeTruthy();
    expect(getByText("EMAIL")).toBeTruthy();
  });

  it("should display user information", () => {
    const { getByDisplayValue, getByText } = render(<EditProfileScreen />);
    expect(getByDisplayValue("Test User")).toBeTruthy();
    expect(getByText("test@ucr.edu")).toBeTruthy();
    expect(getByText("(UCR Verified)")).toBeTruthy();
  });

  it("should display optional user fields when available", () => {
    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("BIRTHDAY")).toBeTruthy();
    expect(getByText("1990-01-01")).toBeTruthy();
    expect(getByText("PHONE NUMBER")).toBeTruthy();
    expect(getByText("1234567890")).toBeTruthy();
    expect(getByText("ADDRESS")).toBeTruthy();
    expect(getByText("123 Test St")).toBeTruthy();
  });

  it("should not display optional fields when not available", () => {
    const userWithoutOptional = {
      ...mockUser,
      birthday: undefined,
      phone_number: undefined,
      address: undefined,
    };

    (useAuth as jest.Mock).mockReturnValueOnce({
      ...mockAuth,
      user: userWithoutOptional,
    });

    const { queryByText } = render(<EditProfileScreen />);
    expect(queryByText("BIRTHDAY")).toBeNull();
    expect(queryByText("PHONE NUMBER")).toBeNull();
    expect(queryByText("ADDRESS")).toBeNull();
  });

  it("should show loading state when user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
    });

    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("Loading user data...")).toBeTruthy();
  });

  it("should show loading state when user is null", () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      isAuthenticated: true,
    });

    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("Loading user data...")).toBeTruthy();
  });

  it("should navigate back when Go Back button is pressed", () => {
    const { getByText } = render(<EditProfileScreen />);
    const goBackButton = getByText("Go Back");

    fireEvent.press(goBackButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should display profile editing message", () => {
    const { getByText } = render(<EditProfileScreen />);
    expect(
      getByText("Profile editing will be available in a future update"),
    ).toBeTruthy();
  });

  it("should render PhotoPicker component", () => {
    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("PHOTO")).toBeTruthy();
  });

  it("should render TopBar component", () => {
    const { getByText } = render(<EditProfileScreen />);
    expect(getByText("R'ATE")).toBeTruthy();
  });
});
