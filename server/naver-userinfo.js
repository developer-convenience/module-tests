const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

export async function fetchNaverUserinfo(authorization) {
  const naverResponse = await fetch(NAVER_USERINFO_URL, {
    headers: { Authorization: authorization },
  });

  if (!naverResponse.ok) {
    const body = await naverResponse.text();
    const error = new Error("Failed to fetch user info from Naver");
    error.status = naverResponse.status;
    error.body = body;
    throw error;
  }

  const data = await naverResponse.json();
  const profile = data?.response;

  if (!profile?.id) {
    const error = new Error("Invalid Naver userinfo response");
    error.status = 502;
    throw error;
  }

  return {
    sub: String(profile.id),
    email: profile.email,
    email_verified: Boolean(profile.email),
    name: profile.name,
    nickname: profile.nickname,
    picture: profile.profile_image,
  };
}
