import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { PhotoPicker } from "../../components/PhotoPicker";
import * as ImagePicker from "expo-image-picker";

jest.mock("expo-image-picker");
jest.spyOn(Alert, "alert");

describe("PhotoPicker Component", () => {
  const mockOnPhotoChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
  });

  it("should render without photo", () => {
    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    expect(getByText("PHOTO")).toBeTruthy();
    expect(getByText("Add a photo")).toBeTruthy();
  });

  it("should render with photo", () => {
    const photoUri = "file:///path/to/photo.jpg";
    const { getByText } = render(
      <PhotoPicker photo={photoUri} onPhotoChange={mockOnPhotoChange} />,
    );
    expect(getByText("PHOTO")).toBeTruthy();
  });

  it("should show image picker options when pressed", () => {
    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Select Photo",
        "Choose an option",
        expect.any(Array),
        { cancelable: true },
      );
    }
  });

  it("should open gallery when permission is granted", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///path/to/photo.jpg" }],
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const chooseFromLibrary = alertCall[2][1];
      await chooseFromLibrary.onPress();

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        expect(mockOnPhotoChange).toHaveBeenCalledWith(
          "file:///path/to/photo.jpg",
        );
      });
    }
  });

  it("should handle gallery permission undetermined", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "undetermined",
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const chooseFromLibrary = alertCall[2][1];
      await chooseFromLibrary.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permission Required",
          "Please grant photo library access to select photos.",
        );
      });
    }
  });

  it("should handle gallery permission denied", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "denied",
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const chooseFromLibrary = alertCall[2][1];
      await chooseFromLibrary.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permission Denied",
          "Photo library access was denied. Please enable it in your device settings to select photos.",
        );
      });
    }
  });

  it("should handle gallery error", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockRejectedValue(new Error("Permission error"));

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const chooseFromLibrary = alertCall[2][1];
      await chooseFromLibrary.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Failed to access photos. Please try again.",
        );
      });
    }
  });

  it("should not call onPhotoChange when gallery is canceled", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const chooseFromLibrary = alertCall[2][1];
      await chooseFromLibrary.onPress();

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        expect(mockOnPhotoChange).not.toHaveBeenCalled();
      });
    }
  });

  it("should open camera when permission is granted", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///path/to/camera-photo.jpg" }],
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const takePhoto = alertCall[2][0];
      await takePhoto.onPress();

      await waitFor(() => {
        expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
        expect(mockOnPhotoChange).toHaveBeenCalledWith(
          "file:///path/to/camera-photo.jpg",
        );
      });
    }
  });

  it("should handle camera permission undetermined", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const takePhoto = alertCall[2][0];
      await takePhoto.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permission Required",
          "Please grant camera access to take photos.",
        );
      });
    }
  });

  it("should handle camera permission denied", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const takePhoto = alertCall[2][0];
      await takePhoto.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permission Denied",
          "Camera access was denied. Please enable it in your device settings to take photos.",
        );
      });
    }
  });

  it("should handle camera error", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error("Camera error"),
    );

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const takePhoto = alertCall[2][0];
      await takePhoto.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Failed to open camera. Please try again.",
        );
      });
    }
  });

  it("should not call onPhotoChange when camera is canceled", async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByText } = render(
      <PhotoPicker photo={undefined} onPhotoChange={mockOnPhotoChange} />,
    );
    const pressable = getByText("Add a photo").parent?.parent;
    if (pressable) {
      fireEvent.press(pressable);

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const takePhoto = alertCall[2][0];
      await takePhoto.onPress();

      await waitFor(() => {
        expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
        expect(mockOnPhotoChange).not.toHaveBeenCalled();
      });
    }
  });
});
