# PDF 폼 텍스트 잘림 대응 가이드

## 목적
PDF 다운로드 시 매핑된 값이 폼 박스를 넘어서 잘리거나, 클릭 전/후 표시가 달라지는 문제를 재발 없이 처리하기 위한 기준 문서다.

대상 로직은 [`src/lib/pdf/pdf-filler.ts`](/Users/hyson/welkit/linkvisa/linkvisa_web/src/lib/pdf/pdf-filler.ts) 이다.

## 이번에 확인된 실제 문제
- `고용사유서`의 `t40` 필드는 멀티라인 영역인데, 긴 텍스트가 들어가도 글씨가 충분히 줄어들지 않아 PDF에서 하단이 잘렸다.
- `통합 신청서`의 `t34` 필드는 폭이 작은 단일라인 영역인데, 예를 들어 `"오산대학교"`가 `"오산대학"`까지만 보이고 클릭해야 전체가 보였다.

## 원인
- 기존 fit 계산이 실제 `pdf-lib` 렌더링 규칙보다 낙관적이었다.
- 특히 멀티라인 필드는 실제 렌더링에서 `lineHeight = fontHeight * 1.2`로 계산되는데, 기존 로직은 이 여유 높이를 반영하지 않았다.
- 필드마다 단일라인/멀티라인 특성이 다른데 공통 방식으로만 폭/높이를 계산하고 있었다.
- 일부 템플릿은 `pdf-lib`의 `form.flatten()`이 요구하는 annotation/page 연결이 불완전해서, 무조건 flatten하면 에러가 발생했다.
- 이 경우 PDF viewer가 interactive field처럼 동작하면서 클릭 전/후 표시 차이가 생길 수 있다.

## 해결 원칙
- 텍스트 fit 계산은 반드시 실제 PDF 렌더링과 최대한 같은 기준으로 잡는다.
- 단일라인과 멀티라인은 분리해서 계산한다.
- 템플릿 기본 폰트 크기를 상한으로 쓰고, 필요한 경우만 줄인다.
- 텍스트가 잘리는 것보다 전체가 보이는 것을 우선한다.
- flatten은 항상 되는 것이 아니므로, 템플릿 구조를 확인한 뒤 조건부로만 적용한다.

## 현재 적용된 방식
[`src/lib/pdf/pdf-filler.ts`](/Users/hyson/welkit/linkvisa/linkvisa_web/src/lib/pdf/pdf-filler.ts) 에 아래 방식이 들어가 있다.

### 1. 단일라인 필드 처리
- 위젯 rectangle에서 실제 사용 가능한 폭/높이를 계산한다.
- border width와 내부 padding을 제외한 크기로 fit 계산을 한다.
- 텍스트 폭과 폰트 높이가 모두 들어가는 최대 font size를 찾는다.

### 2. 멀티라인 필드 처리
- 줄바꿈 가능한 라인 수를 직접 계산한다.
- 줄 높이는 `font.heightAtSize(size) * 1.2`로 계산한다.
- `lines * lineHeight <= fieldHeight`를 만족하는 최대 font size를 찾는다.
- 긴 한글 문장은 공백 기준 분할이 가능하면 공백에서 먼저 끊고, 아니면 문자 단위로라도 끊어서 전체가 보이게 한다.

### 3. 기본 폰트 크기 사용 방식
- PDF 템플릿의 `DA`에서 기본 폰트 크기를 읽어 상한값으로 사용한다.
- 기본 크기로 안 들어갈 때만 점진적으로 축소한다.
- 현재 최소 폰트 크기는 `2`까지 허용한다.

### 4. viewer 재렌더링 완화
- 필드는 `readOnly`로 잠근다.
- `NeedAppearances=false`를 설정해서 PDF viewer가 자체 appearance를 다시 만들 가능성을 줄인다.

### 5. flatten 적용 방식
- 모든 필드/위젯이 실제 page를 찾을 수 있을 때만 `form.flatten()`을 수행한다.
- 템플릿 구조상 flatten이 불가능하면 건너뛴다.
- 이유: 일부 템플릿은 `pdf-lib` flatten 과정에서 `Could not find page for PDFRef ...` 오류가 난다.

## 나중에 비슷한 문제가 생기면 이렇게 확인
1. 문제가 생긴 필드명이 무엇인지 확인한다.
2. 해당 필드가 단일라인인지 멀티라인인지 확인한다.
3. 템플릿 PDF에서 위젯 rectangle의 `width`, `height`를 확인한다.
4. 템플릿 `DA`의 기본 폰트 크기를 확인한다.
5. 현재 값이 폭 기준으로 안 맞는지, 높이 기준으로 안 맞는지 분리해서 본다.
6. 멀티라인이면 줄 높이 1.2 배수를 반영했는지 확인한다.
7. 다운로드 후 클릭 전/후 표시가 다르면 flatten 가능 여부와 `NeedAppearances` 설정을 확인한다.

## 수정할 때 지켜야 할 규칙
- 특정 필드 하나만 예외 처리로 때우기보다 공통 fit 로직을 먼저 수정한다.
- 새 템플릿이 추가되면 flatten 가능 여부를 먼저 확인한다.
- 한글 폰트로 `updateAppearances()`를 계속 호출해야 한다.
- `setText()`만 하고 appearance를 안 갱신하면 viewer마다 다르게 보일 수 있다.
- 텍스트가 길어서 줄어드는 경우, 폭뿐 아니라 높이도 반드시 같이 계산해야 한다.

## 빠른 점검 예시
- 단일라인: `"오산대학교"`가 처음 열었을 때 전부 보여야 한다.
- 멀티라인: 긴 기타사항 문장이 박스 바깥으로 잘리지 않아야 한다.
- flatten 가능한 템플릿: 최종 PDF가 클릭 여부와 무관하게 동일하게 보여야 한다.
- flatten 불가능한 템플릿: 최소한 콘솔 에러 없이 다운로드되고, generated appearance가 우선 표시되어야 한다.

## 관련 장애 이력
- 증상: `고용사유서 t40` 잘림, `통합 신청서 t34` 클릭 전 잘림
- 해결: fit 계산 고도화, `NeedAppearances=false`, 조건부 flatten
- 관련 커밋: `87f5150` (`Fix PDF field text fitting for downloads`)
