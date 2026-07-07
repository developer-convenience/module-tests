import "./load-env.js";

import cors from "cors";

import express from "express";

import {

  claimOrder,

  isValidOrderStatus,

  listAllOrders,

  listOrdersForUser,

  saveOrderAfterPayment,

  updateOrderStatus,

  findOrderByOrderId,

} from "./orders.js";

import { fetchNaverUserinfo } from "./naver-userinfo.js";
import { getUserFromRequest, supabaseConfigured } from "./supabase.js";



const app = express();

const PORT = process.env.PORT || 3001;

const SECRET_KEY = process.env.TOSS_SECRET_KEY;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;



function createCorsOptions() {
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (!raw) {
    return { origin: true };
  }

  const allowed = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
  };
}

app.use(cors(createCorsOptions()));

app.use(express.json());



function requireSupabase(_req, res, next) {

  if (!supabaseConfigured) {

    return res.status(503).json({

      code: "SUPABASE_NOT_CONFIGURED",

      message: "Supabase 환경변수가 설정되지 않았습니다. .env를 확인하세요.",

    });

  }

  next();

}



function requireAdmin(req, res, next) {

  const password = req.headers["x-admin-password"];

  if (!ADMIN_PASSWORD) {

    return res.status(503).json({

      code: "ADMIN_NOT_CONFIGURED",

      message: "ADMIN_PASSWORD가 설정되지 않았습니다.",

    });

  }

  if (password !== ADMIN_PASSWORD) {

    return res.status(401).json({

      code: "UNAUTHORIZED",

      message: "관리자 인증에 실패했습니다.",

    });

  }

  next();

}



async function requireUser(req, res, next) {

  const user = await getUserFromRequest(req);

  if (!user) {

    return res.status(401).json({

      code: "UNAUTHORIZED",

      message: "로그인이 필요합니다.",

    });

  }

  req.user = user;

  next();

}



app.get("/api/health", (_req, res) => {

  res.json({

    ok: true,

    payments: Boolean(SECRET_KEY),

    supabase: supabaseConfigured,

    admin: Boolean(ADMIN_PASSWORD),

  });

});



// Supabase Custom Provider(naver) userinfo 프록시 — 네이버 응답을 OIDC 표준 형식으로 변환
app.get("/api/auth/naver/userinfo", async (req, res) => {

  const authorization = req.headers.authorization;

  if (!authorization) {

    return res.status(401).json({ error: "Missing Authorization header" });

  }



  try {

    const profile = await fetchNaverUserinfo(authorization);

    return res.json(profile);

  } catch (error) {

    console.error("[auth/naver/userinfo]", error);

    return res.status(error.status ?? 500).json({

      error: error.message ?? "Failed to fetch Naver user profile",

    });

  }

});



app.post("/api/payments/confirm", requireSupabase, async (req, res) => {

  const { paymentKey, orderId, amount, shipping, items, orderName } = req.body ?? {};



  if (!paymentKey || !orderId || amount == null) {

    return res.status(400).json({

      code: "INVALID_REQUEST",

      message: "paymentKey, orderId, amount가 필요합니다.",

    });

  }



  if (!shipping || !items || !orderName) {

    return res.status(400).json({

      code: "INVALID_REQUEST",

      message: "shipping, items, orderName이 필요합니다.",

    });

  }



  if (!SECRET_KEY) {

    return res.status(503).json({

      code: "MISSING_SECRET_KEY",

      message: "서버에 TOSS_SECRET_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.",

    });

  }



  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {

    return res.status(400).json({

      code: "INVALID_AMOUNT",

      message: "유효하지 않은 결제 금액입니다.",

    });

  }



  try {

    const encoded = Buffer.from(`${SECRET_KEY}:`).toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {

      method: "POST",

      headers: {

        Authorization: `Basic ${encoded}`,

        "Content-Type": "application/json",

      },

      body: JSON.stringify({

        paymentKey,

        orderId,

        amount: numericAmount,

      }),

    });



    const data = await tossRes.json();



    if (!tossRes.ok) {

      return res.status(tossRes.status).json(data);

    }



    const user = await getUserFromRequest(req);

    const saved = await saveOrderAfterPayment({

      orderId,

      userId: user?.id ?? null,

      amount: numericAmount,

      orderName,

      shipping,

      items,

      paymentKey,

      paymentMethod: data.method ?? null,

      approvedAt: data.approvedAt ?? new Date().toISOString(),

    });



    return res.json({

      ...data,

      claimToken: saved.claimToken,

      orderSaved: true,

    });

  } catch (error) {

    console.error("[payments/confirm]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "결제 승인 중 오류가 발생했습니다.",

    });

  }

});



app.get("/api/orders/me", requireSupabase, requireUser, async (req, res) => {

  try {

    const orders = await listOrdersForUser(req.user.id);

    return res.json({ orders });

  } catch (error) {

    console.error("[orders/me]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "주문 목록을 불러오지 못했습니다.",

    });

  }

});



app.get("/api/orders/:orderId", requireSupabase, requireUser, async (req, res) => {

  try {

    const order = await findOrderByOrderId(req.params.orderId);

    if (!order || order.user_id !== req.user.id) {

      return res.status(404).json({

        code: "NOT_FOUND",

        message: "주문을 찾을 수 없습니다.",

      });

    }

    return res.json({ order });

  } catch (error) {

    console.error("[orders/:orderId]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "주문 정보를 불러오지 못했습니다.",

    });

  }

});



app.post("/api/orders/:orderId/claim", requireSupabase, requireUser, async (req, res) => {

  const { claimToken } = req.body ?? {};

  if (!claimToken) {

    return res.status(400).json({

      code: "INVALID_REQUEST",

      message: "claimToken이 필요합니다.",

    });

  }



  try {

    const result = await claimOrder({

      orderId: req.params.orderId,

      claimToken,

      userId: req.user.id,

    });



    if (!result.ok) {

      const status =

        result.code === "NOT_FOUND" ? 404 : result.code === "UNAUTHORIZED" ? 401 : 400;

      return res.status(status).json({

        code: result.code,

        message: result.message,

      });

    }



    return res.json({ order: result.order, alreadyClaimed: result.alreadyClaimed ?? false });

  } catch (error) {

    console.error("[orders/claim]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "주문 연결 중 오류가 발생했습니다.",

    });

  }

});



app.get("/api/admin/orders", requireSupabase, requireAdmin, async (_req, res) => {

  try {

    const orders = await listAllOrders();

    return res.json({ orders });

  } catch (error) {

    console.error("[admin/orders]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "주문 목록을 불러오지 못했습니다.",

    });

  }

});



app.patch("/api/admin/orders/:orderId/status", requireSupabase, requireAdmin, async (req, res) => {

  const { status } = req.body ?? {};

  if (!isValidOrderStatus(status)) {

    return res.status(400).json({

      code: "INVALID_STATUS",

      message: "유효하지 않은 주문 상태입니다.",

    });

  }



  try {

    const result = await updateOrderStatus(req.params.orderId, status);

    if (!result.ok) {

      return res.status(404).json({

        code: result.code,

        message: result.message,

      });

    }

    return res.json({ order: result.order, unchanged: result.unchanged ?? false });

  } catch (error) {

    console.error("[admin/orders/status]", error);

    return res.status(500).json({

      code: "SERVER_ERROR",

      message: "주문 상태 변경 중 오류가 발생했습니다.",

    });

  }

});



app.listen(PORT, () => {

  console.log(`[leather-shop server] http://localhost:${PORT}`);

  if (!SECRET_KEY) {

    console.warn("[leather-shop server] TOSS_SECRET_KEY 미설정 — 결제 승인 API 비활성");

  }

  if (!supabaseConfigured) {

    console.warn("[leather-shop server] Supabase 미설정 — 주문 저장 API 비활성");

  }

  if (!ADMIN_PASSWORD) {

    console.warn("[leather-shop server] ADMIN_PASSWORD 미설정 — 관리자 API 비활성");

  }

});


