import "@testing-library/jest-native/extend-expect";

jest.mock("lucide-react-native", () => {
  const mockReact = jest.requireActual("react");
  return {
    ChevronRight: (props) =>
      mockReact.createElement("View", {
        "data-testid": "chevron-right",
        ...props,
      }),
  };
});

jest.mock("nativewind", () => ({
  styled: jest.fn((Component) => Component),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));
