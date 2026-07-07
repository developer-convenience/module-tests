const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

Deno.serve(async (req: Request) => {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const naverResponse = await fetch(NAVER_USERINFO_URL, {
    headers: { Authorization: authorization },
  });

  if (!naverResponse.ok) {
    return Response.json(
      { error: "Failed to fetch user info from Naver" },
      { status: naverResponse.status },
    );
  }

  const data = await naverResponse.json();
  const profile = data?.response;

  if (!profile?.id) {
    return Response.json({ error: "Invalid Naver userinfo response" }, { status: 502 });
  }

  return Response.json({
    sub: String(profile.id),
    email: profile.email,
    email_verified: Boolean(profile.email),
    name: profile.name,
    nickname: profile.nickname,
    picture: profile.profile_image,
  });
});
