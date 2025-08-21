# 2025 Fall Semester Capstone Project - Chung Ang Univ. (FE)

## 🔃 Issue branch 기반 git 전략

**Commit Convention**

타입: 부연 설명 및 이유 #이슈번호

```
//ex. feat: Login 화면 UI 구현 #1
```

**Branch**

(feat/fix/refactor/chore)/#이슈번호-(UI/API)-기능설명

```jsx
ex) feat/#2-UI-home
ex) feat/#16-API-create-post
```

**Git Flow**

1. Issue 생성
2. Branch 생성
3. add → commit → push → pull request 과정을 거친다.
4. 코드 리뷰 진행 후 담당 팀원들의 승인을 받는다.
5. develop branch로 merge한다.

**develop branch으로 이동하여 pull을 받은 다음 위 과정을 반복한다.**
