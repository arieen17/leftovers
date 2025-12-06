import { jest } from "@jest/globals";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock("../../public/images/bear.svg", () => {
  const mockReact = jest.requireActual("react");
  return (props: any) =>
    mockReact.createElement("View", { ...props, testID: "bear-icon" });
});

jest.mock("lucide-react-native", () => {
  const mockReact = jest.requireActual("react");
  return {
    Search: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "search-icon" }),
    X: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "clear-icon" }),
    ChevronRight: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-right" }),
    ChevronDown: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-down" }),
    ChevronUp: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "chevron-up" }),
    Star: (props: any) =>
      mockReact.createElement("View", {
        ...props,
        testID: `star-${props.fill || "empty"}`,
      }),
    Heart: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "heart-icon" }),
    MessageCircle: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "message-icon" }),
    Send: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "send-icon" }),
    Trash2: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "trash-icon" }),
    Camera: (props: any) =>
      mockReact.createElement("View", { ...props, testID: "camera-icon" }),
  };
});

jest.mock("@/context/PostsContext", () => ({
  usePosts: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

jest.mock("../../global.css", () => ({}));
