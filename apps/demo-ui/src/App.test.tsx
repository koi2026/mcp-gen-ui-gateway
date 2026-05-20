import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders fixture-backed benefit recommendations and safety notice", () => {
    render(<App />);

    expect(screen.getByText("서울 청년 월세 지원")).toBeInTheDocument();
    expect(screen.getByText("신청 준비 체크리스트")).toBeInTheDocument();
    expect(screen.getByText(/본인인증/)).toBeInTheDocument();
  });
});
