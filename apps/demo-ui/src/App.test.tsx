import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders fixture-backed public data GenUI mock and safety notice", () => {
    const { container } = render(<App />);

    expect(screen.getByText("이 누리집은 대한민국 공식 전자정부 누리집입니다.")).toBeInTheDocument();
    expect(screen.getByText("자주 찾는 서비스")).toBeInTheDocument();
    expect(screen.getByText("원스톱 서비스")).toBeInTheDocument();
    expect(screen.getByText("이 페이지에 만족하시나요?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /위로 이동/ })).toBeInTheDocument();
    expect(screen.getByText("개인정보처리방침")).toBeInTheDocument();
    expect(screen.getByText("최근에 본 서비스가 없습니다.")).toBeInTheDocument();
    expect(container.querySelectorAll(".gov24-icon").length).toBeGreaterThan(12);

    fireEvent.click(screen.getByRole("button", { name: /For Foreigners/ }));
    expect(screen.getByRole("menuitem", { name: "English" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /민원서비스/ }));
    expect(screen.getByText("사실/진위확인")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /고객센터/ }));
    expect(screen.getAllByText("상담예약").length).toBeGreaterThan(0);

    expect(screen.getByRole("button", { name: "자주 찾는 서비스 이전 목록" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "이전 배너" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "통합검색" }));
    expect(screen.getByRole("dialog", { name: "통합검색" })).toBeInTheDocument();
    expect(screen.getByText("최근 검색어가 없습니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(screen.getByRole("dialog", { name: "통합검색" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: /펼쳐보기/ }));
    expect(screen.getByRole("dialog", { name: "자주 찾는 서비스 모아보기" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getAllByRole("button", { name: "로그인" })[0]);
    expect(screen.getByRole("dialog", { name: "안내" })).toBeInTheDocument();
    expect(screen.getByText("로그인이 필요한 메뉴입니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: "전체메뉴" }));
    expect(screen.getByRole("dialog", { name: "전체메뉴" })).toBeInTheDocument();
    expect(screen.getAllByText("다운로드파일 진본확인").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: /토지\(임야\)대장/ }));
    expect(screen.getByText("선택한 서비스")).toBeInTheDocument();
    expect(screen.getByText("민원 검색 결과")).toBeInTheDocument();
    expect(screen.getByText("신청 방법 및 절차")).toBeInTheDocument();
    expect(screen.getByText("출처 및 응답 상태")).toBeInTheDocument();
    expect(screen.getByText("MCP Tool 호출 로그")).toBeInTheDocument();
    expect(screen.getByText("Gateway 응답 계약")).toBeInTheDocument();
    expect(screen.getByText(/인증키 미발급 API/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "링크복사" }));
    expect(screen.getByRole("status")).toHaveTextContent("링크가 복사되었습니다.");
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));
    expect(screen.getByText("자주 찾는 서비스")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "정부24 안내열기" }));
    expect(screen.getByText(/여러 공공 API와 MCP 응답/)).toBeInTheDocument();
  });
});
