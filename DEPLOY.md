# Leather Shop 배포 가이드 (Netlify + Render)

프론트엔드는 **Netlify**, API 서버는 **Render Free**에 배포합니다.

## 보안: public 레포여도 괜찮은가?

| 노출되는 것 | 위험도 | 이유 |
|------------|--------|------|
| `schema.sql`, API 경로, 프론트 소스 | 낮음 | 구조만 보임. 실제 데이터·비밀키는 없음 |
| `VITE_SUPABASE_ANON_KEY` | 의도된 공개 | Supabase **RLS**가 본인 데이터만 허용 |
| `VITE_TOSS_CLIENT_KEY` (test_ck_) | 낮음 | 클라이언트 키는 브라우저에 노출되는 설계 |
| `TOSS_SECRET_KEY`, `SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` | **절대 커밋 금지** | Render/Netlify 환경변수에만 입력 |

**관리자 페이지**는 URL(`?page=admin`)이 코드에 보이지만, API는 `ADMIN_PASSWORD` 없이는 401입니다. Basic Auth는 추후 추가 가능합니다.

`.env`는 `.gitignore`에 포함되어 있어 Git에 올라가지 않습니다. 혹시 과거에 커밋했다면 키를 **즉시 로테이션**하세요.

---

## 1. Render — API 서버

1. [render.com](https://render.com) → GitHub 연동
2. **New → Blueprint** → 이 레포 선택 (`render.yaml` 자동 인식)
   - 또는 **New → Web Service** 수동 설정:
     - Root Directory: `leather-shop`
     - Build: `npm install`
     - Start: `npm start`
     - Health Check: `/api/health`
3. Environment Variables 입력:

| 변수 | 값 |
|------|-----|
| `TOSS_SECRET_KEY` | test_sk_... |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 |
| `ALLOWED_ORIGINS` | `https://<netlify-사이트>.netlify.app` |

4. 배포 후 API URL 확인 (예: `https://leather-shop-api.onrender.com`)
5. `https://<api-url>/api/health` → `{ "ok": true, ... }` 확인

> Render Free는 15분 미사용 시 슬립 → 첫 요청 30~60초 콜드스타트 가능

---

## 2. Netlify — 프론트엔드

1. [netlify.com](https://netlify.com) → GitHub 연동
2. **Add new site → Import an existing project**
3. Build settings — **레포 루트 `netlify.toml`이 있으면 UI 설정은 비워 두거나 아래와 맞추세요:**
   - Base directory: `leather-shop`
   - Build command: `npm ci && npm run build`
   - Publish directory: `dist` (⚠️ `leather-shop` 폴더 자체가 아님)
4. Environment Variables:

| 변수 | 값 |
|------|-----|
| `VITE_TOSS_CLIENT_KEY` | test_ck_... |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public 키 |
| `VITE_API_BASE_URL` | Render API URL (예: `https://leather-shop-api.onrender.com`) |

5. Deploy → 사이트 URL 확인 (예: `https://your-site.netlify.app`)

---

## 3. Supabase 설정

**Authentication → URL Configuration**

- Site URL: `https://<netlify-사이트>.netlify.app`
- Redirect URLs:
  - `https://<netlify-사이트>.netlify.app/**`
  - `http://localhost:5173/**` (로컬 개발)

**SQL Editor**에서 `supabase/schema.sql` 실행 (아직 안 했다면)

### 네이버 로그인 (Custom Provider)

Supabase에는 네이버 내장 프로바이더가 없습니다. Custom Provider + userinfo 프록시가 필요합니다.

**1) Render API에 userinfo 프록시 배포**

이 레포의 `server/index.js`에 `/api/auth/naver/userinfo`가 포함되어 있습니다.  
Render에 API를 배포한 뒤 아래 URL이 동작하는지 확인하세요.

```
https://<render-api-url>/api/auth/naver/userinfo
```

(Authorization 헤더 없이 호출하면 `401` — 정상)

**2) Supabase → Authentication → Custom Providers → naver (Manual)**

| 필드 | 값 |
|------|-----|
| Configuration | Manual |
| Issuer URL | `https://nid.naver.com` |
| Authorization URL | `https://nid.naver.com/oauth2/authorize` |
| Token URL | `https://nid.naver.com/oauth2/token` |
| JWKS URI | `https://nid.naver.com/oauth2/jwks` |
| **Userinfo URL** | `https://<render-api-url>/api/auth/naver/userinfo` |
| Scopes | `profile` (**`openid` 넣지 않기**) |
| Client ID / Secret | 네이버 개발자센터 값 |

> Edge Function 대안: `supabase functions deploy naver-userinfo --no-verify-jwt` 후  
> Userinfo URL을 `https://<project>.supabase.co/functions/v1/naver-userinfo` 로 설정해도 됩니다.

**3) 네이버 개발자센터**

| 필드 | 값 |
|------|-----|
| Callback URL | `https://<project>.supabase.co/auth/v1/callback` |
| API 권한 — 이메일 | **필수 동의** (없으면 Supabase가 사용자 생성 실패) |

**4) 프론트 코드**

네이버는 `custom:naver`로 호출합니다 (`AuthContext.tsx`에 매핑됨).

---

## 4. 토스페이먼츠 (테스트)

개발자센터에서 테스트 키 사용 중이면, 결제 성공/실패 URL은 앱이 `origin?page=checkout-success` 형태로 자동 생성합니다.  
별도 도메인 등록이 필요한 경우 Netlify URL을 허용 목록에 추가하세요.

---

## 5. 배포 후 체크리스트

- [ ] Netlify 사이트 로딩
- [ ] 소셜 로그인 (Supabase Redirect URL)
- [ ] 장바구니 → 결제 (첫 API 호출 시 Render 콜드스타트 대기)
- [ ] 결제 성공 후 주문 저장
- [ ] 마이페이지 주문 목록
- [ ] `?page=admin` + 관리자 비밀번호

---

## 로컬 개발

```bash
cd leather-shop
cp .env.example .env   # 키 입력
npm install
npm run dev:all        # 프론트 :5173 + API :3001
```

로컬에서는 `VITE_API_BASE_URL`을 설정하지 않습니다 (Vite가 `/api`를 프록시).

---

## 문제 해결

### `MIME type application/octet-stream` / module script 오류

**원인:** Netlify가 **빌드 결과(`dist`)가 아닌 소스**를 배포한 경우입니다.  
소스 `index.html`은 `<script src="/src/main.tsx">`를 가리키고, Netlify는 `.tsx`를 `application/octet-stream`으로 내려줍니다.

**확인:** 배포된 사이트에서 페이지 소스 보기 → script가 `/src/main.tsx`면 잘못된 배포입니다.  
정상이면 `/assets/index-xxxxx.js` 형태입니다.

**수정:**

1. Netlify → **Site configuration → Build & deploy → Build settings**
2. Publish directory를 **`dist`** 로 변경 (Base directory가 `leather-shop`일 때)
3. `leather-shop` 또는 레포 루트를 publish 하지 않도록 확인
4. **Trigger deploy → Clear cache and deploy site**
5. 최신 커밋에 레포 루트 `netlify.toml` 포함 후 push
