export const THEME_STORAGE_KEY = "linknamu-theme";

/**
 * 첫 화면을 그리기 전에 실행되어 저장된 테마(없으면 기기 설정)를 <html data-theme>에 적용한다.
 * 화면이 잠깐 반대 색으로 깜빡이는 것을 막기 위해 layout의 <head>에 인라인으로 넣는다.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;
