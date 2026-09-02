# drbae-customer — 다국어(KO/EN/JA/FR) 구조

## 파일
| 파일 | 역할 |
|---|---|
| `index.html` | 한국어 원문. 번역 대상 요소에 `data-i18n="tNNN"` (본문), `data-i18n-alt` (이미지 alt), `data-i18n-meta` (meta content) 부여 |
| `i18n/i18n.js` | 런타임. 언어 판별 → 사전 치환 → 스위처 렌더링 |
| `i18n/ko.js` `en.js` `ja.js` `fr.js` | 언어별 사전 `window.I18N.<lang> = { key: html }` (381개 키) |

## 언어 결정 순서
`?lang=en|ja|fr` URL 파라미터 → `localStorage(drbae.lang)` → 브라우저 언어 → `ko`
- 관리실별 QR 코드에 `https://baelab-create.github.io/drbae-customer/?lang=ja` 처럼 언어를 미리 심을 수 있음
- 사전에 키가 없으면 한국어 원문이 그대로 남음(누락 안전)

## 문구 수정 방법
1. **한국어**: `index.html`에서 직접 수정 (data-i18n 속성은 그대로 둘 것)
2. **외국어**: 해당 `i18n/<lang>.js`에서 같은 키의 값을 수정
3. `<b>`, `<span class="hl">`, `<em>`, `<br>` 등 인라인 태그의 **종류와 순서**는 한국어 원문과 동일하게 유지 (검증 스크립트 `build.py`가 태그 시퀀스를 대조함)

## 새 문단 추가 시
1. `index.html`의 새 요소에 `data-i18n="t382"` 처럼 **미사용 키**를 부여
2. 4개 사전 모두에 같은 키 추가 (없으면 한국어로 표시됨)

## 폰트
- JA 선택 시에만 Noto Sans JP / Noto Serif JP 를 동적 로드 (`i18n.js`의 `FONTS`)
- 언어별 폭 보정 CSS는 `index.html` 스타일 하단 `/* 언어별 폰트 · 길이 보정 */` 블록

## 주의
- OG/Twitter 메타는 JS로 치환되므로 **SNS 미리보기(크롤러)는 항상 한국어**로 표시됨. 언어별 미리보기가 필요하면 `en.html` 등 별도 진입 HTML을 두는 방식으로 확장 가능
- `noindex, nofollow` 는 그대로 유지됨
