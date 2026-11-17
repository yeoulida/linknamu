/**
 * 개발 모드에서만 요소에 구성요소 이름표를 붙인다.
 * ComponentInspector가 이 속성을 읽어 화면에서 구성요소를 표시한다.
 * 배포(production) 빌드에서는 빈 객체를 돌려주므로 HTML에 아무것도 남지 않는다.
 *
 * 사용법: <div {...inspect("LinkCard", "src/components/LinkCard.tsx")}>
 */
export function inspect(name: string, file: string): Record<string, string> {
  if (process.env.NODE_ENV !== "development") return {};
  return { "data-component": name, "data-file": file };
}
