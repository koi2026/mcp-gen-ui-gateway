import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders fixture-backed public data GenUI mock and safety notice", () => {
    const { container } = render(<App />);

    expect(screen.getByText("이 누리집은 대한민국 공식 전자정부 누리집입니다.")).toBeInTheDocument();
    expect(screen.getByText("자주 찾는 서비스")).toBeInTheDocument();
    expect(screen.getByText("원스톱 서비스")).toBeInTheDocument();
    expect(screen.getByText("출처 및 응답 상태")).toBeInTheDocument();
    expect(screen.getByText("MCP Tool 호출 로그")).toBeInTheDocument();
    expect(screen.getByText("Gateway 응답 계약")).toBeInTheDocument();
    expect(screen.getByText(/인증키 미발급 API/)).toBeInTheDocument();
    expect(container.querySelectorAll(".gov24-icon").length).toBeGreaterThan(12);
  });
});
