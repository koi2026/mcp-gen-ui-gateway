import { fireEvent, render, screen, within } from "@testing-library/react";
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
    fireEvent.click(screen.getByRole("button", { name: /화면크기/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "크게" }));
    expect(container.querySelector(".g24-shell")).toHaveStyle({ "--g24-font-scale": "1.12" });

    fireEvent.click(screen.getByRole("button", { name: /민원서비스/ }));
    expect(screen.getByText("사실/진위확인")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /고객센터/ }));
    expect(screen.getAllByText("상담예약").length).toBeGreaterThan(0);

    expect(screen.getByRole("button", { name: "자주 찾는 서비스 이전 목록" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "이전 배너" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "자주 찾는 서비스 다음 목록" }));
    expect(screen.getByText("인감증명서")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "자주 찾는 서비스 이전 목록" }));
    expect(screen.getByText("토지(임야)대장")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결혼" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "임신•출산" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "보건•복지" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "임신•출산" }));
    expect(screen.getByRole("button", { name: /아이가 태어났을 때/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "육아" }));
    expect(screen.getByText("아이를 어린이집에 보내려고 할 때")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음 배너" }));
    expect(screen.getByText("데이터 출처와 상태까지")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "통합검색" }));
    const searchDialog = screen.getByRole("dialog", { name: "통합검색" });
    expect(searchDialog).toBeInTheDocument();
    expect(screen.getByText("모든 정부 서비스, 이제 한 곳에서 찾아보세요")).toBeInTheDocument();
    expect(screen.getByText("최근 검색어가 없습니다.")).toBeInTheDocument();
    expect(within(searchDialog).getByRole("button", { name: /10\s+지적도\(임야도\)/ })).toBeInTheDocument();
    fireEvent.click(within(searchDialog).getByRole("button", { name: /1\s+토지\(임야\)대장/ }));
    expect(screen.queryByRole("dialog", { name: "통합검색" })).not.toBeInTheDocument();
    expect(screen.getByText("선택한 서비스")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "토지(임야)대장" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));

    fireEvent.click(screen.getByRole("button", { name: /민원서비스/ }));
    fireEvent.click(screen.getByRole("button", { name: "민원 찾기" }));
    expect(screen.getByText("선택한 서비스")).toBeInTheDocument();
    expect(screen.getAllByText("민원 찾기").length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));

    fireEvent.click(screen.getByRole("button", { name: "통합검색" }));
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(screen.getByRole("dialog", { name: "통합검색" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: /펼쳐보기/ }));
    const quickDialog = screen.getByRole("dialog", { name: "자주 찾는 서비스 모아보기" });
    expect(quickDialog).toBeInTheDocument();
    fireEvent.click(within(quickDialog).getByRole("button", { name: /대학교 졸업 증명/ }));
    expect(screen.queryByRole("dialog", { name: "자주 찾는 서비스 모아보기" })).not.toBeInTheDocument();
    expect(screen.getAllByText("대학교 졸업 증명").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));

    fireEvent.click(screen.getAllByRole("button", { name: "로그인" })[0]);
    expect(screen.getByRole("dialog", { name: "안내" })).toBeInTheDocument();
    expect(screen.getByText("로그인이 필요한 메뉴입니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    fireEvent.click(screen.getByRole("button", { name: "전체메뉴" }));
    const mobileDialog = screen.getByRole("dialog", { name: "전체메뉴" });
    expect(mobileDialog).toBeInTheDocument();
    expect(screen.getAllByText("다운로드파일 진본확인").length).toBeGreaterThan(0);
    expect(screen.getByText("서비스 바로가기")).toBeInTheDocument();
    expect(screen.getByText("주민등록증 모바일 확인 서비스")).toBeInTheDocument();
    fireEvent.click(within(mobileDialog).getByRole("button", { name: "사실/진위확인" }));
    expect(screen.queryByRole("dialog", { name: "전체메뉴" })).not.toBeInTheDocument();
    expect(screen.getAllByText("사실/진위확인").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "← 목록으로" }));

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

    fireEvent.click(screen.getByRole("button", { name: "디지털증명" }));
    const footerDialog = screen.getByRole("dialog", { name: "디지털증명" });
    expect(footerDialog).toBeInTheDocument();
    expect(within(footerDialog).getByRole("button", { name: /모바일 신분증/ })).toBeInTheDocument();
  });
});
