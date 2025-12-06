import React from "react";
import { render } from "@testing-library/react-native";
import { AppText } from "../../components/AppText";

describe("AppText Component", () => {
  it("should render without error", () => {
    const { getByText } = render(<AppText>Test Text</AppText>);
    expect(getByText("Test Text")).toBeTruthy();
  });

  it("should render with default props", () => {
    const { getByText } = render(<AppText>Default Text</AppText>);
    expect(getByText("Default Text")).toBeTruthy();
  });

  it("should render with small size", () => {
    const { getByText } = render(<AppText size="small">Small Text</AppText>);
    expect(getByText("Small Text")).toBeTruthy();
  });

  it("should render with medium size", () => {
    const { getByText } = render(<AppText size="medium">Medium Text</AppText>);
    expect(getByText("Medium Text")).toBeTruthy();
  });

  it("should render with large size", () => {
    const { getByText } = render(<AppText size="large">Large Text</AppText>);
    expect(getByText("Large Text")).toBeTruthy();
  });

  it("should render with heading size", () => {
    const { getByText } = render(
      <AppText size="heading">Heading Text</AppText>,
    );
    expect(getByText("Heading Text")).toBeTruthy();
  });

  it("should render with bold prop", () => {
    const { getByText } = render(<AppText bold>Bold Text</AppText>);
    expect(getByText("Bold Text")).toBeTruthy();
  });

  it("should render with primary color", () => {
    const { getByText } = render(
      <AppText color="primary">Primary Text</AppText>,
    );
    expect(getByText("Primary Text")).toBeTruthy();
  });

  it("should render with secondary color", () => {
    const { getByText } = render(
      <AppText color="secondary">Secondary Text</AppText>,
    );
    expect(getByText("Secondary Text")).toBeTruthy();
  });

  it("should render with tertiary color", () => {
    const { getByText } = render(
      <AppText color="tertiary">Tertiary Text</AppText>,
    );
    expect(getByText("Tertiary Text")).toBeTruthy();
  });

  it("should render with center alignment", () => {
    const { getByText } = render(<AppText center>Centered Text</AppText>);
    expect(getByText("Centered Text")).toBeTruthy();
  });

  it("should render with custom className", () => {
    const { getByText } = render(
      <AppText className="custom-class">Custom Text</AppText>,
    );
    expect(getByText("Custom Text")).toBeTruthy();
  });

  it("should render complex children", () => {
    const { getByText } = render(
      <AppText>
        <AppText>Nested Text</AppText>
      </AppText>,
    );
    expect(getByText("Nested Text")).toBeTruthy();
  });
});
