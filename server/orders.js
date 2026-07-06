import { randomUUID } from "crypto";

import { supabaseAdmin } from "./supabase.js";

const ORDER_STATUSES = ["paid", "making", "preparing", "delivered"];
const CLAIM_TTL_MS = 24 * 60 * 60 * 1000;

export function isValidOrderStatus(status) {
  return ORDER_STATUSES.includes(status);
}

export async function findOrderByOrderId(orderId) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveOrderAfterPayment({
  orderId,
  userId,
  amount,
  orderName,
  shipping,
  items,
  paymentKey,
  paymentMethod,
  approvedAt,
}) {
  const existing = await findOrderByOrderId(orderId);
  if (existing) {
    return {
      order: existing,
      claimToken: existing.claim_token,
      created: false,
    };
  }

  const claimToken = userId ? null : randomUUID();
  const claimExpiresAt = userId
    ? null
    : new Date(Date.now() + CLAIM_TTL_MS).toISOString();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      order_id: orderId,
      user_id: userId ?? null,
      amount,
      order_name: orderName,
      shipping,
      items,
      payment_key: paymentKey,
      payment_method: paymentMethod ?? null,
      approved_at: approvedAt,
      claim_token: claimToken,
      claim_expires_at: claimExpiresAt,
      status: "paid",
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabaseAdmin.from("order_status_log").insert({
    order_id: data.id,
    from_status: null,
    to_status: "paid",
  });

  return {
    order: data,
    claimToken,
    created: true,
  };
}

export async function listOrdersForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function claimOrder({ orderId, claimToken, userId }) {
  const order = await findOrderByOrderId(orderId);
  if (!order) {
    return { ok: false, code: "NOT_FOUND", message: "주문을 찾을 수 없습니다." };
  }

  if (order.user_id) {
    if (order.user_id === userId) {
      return { ok: true, order, alreadyClaimed: true };
    }
    return { ok: false, code: "ALREADY_CLAIMED", message: "이미 다른 계정에 연결된 주문입니다." };
  }

  if (!order.claim_token || order.claim_token !== claimToken) {
    return { ok: false, code: "INVALID_TOKEN", message: "주문 연결 토큰이 올바르지 않습니다." };
  }

  if (order.claim_expires_at && new Date(order.claim_expires_at) < new Date()) {
    return { ok: false, code: "EXPIRED", message: "주문 연결 유효 시간이 만료되었습니다." };
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      user_id: userId,
      claimed_at: new Date().toISOString(),
      claim_token: null,
      claim_expires_at: null,
    })
    .eq("id", order.id)
    .is("user_id", null)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) {
    return { ok: false, code: "ALREADY_CLAIMED", message: "이미 연결된 주문입니다." };
  }

  return { ok: true, order: data };
}

export async function listAllOrders() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId, nextStatus) {
  const order = await findOrderByOrderId(orderId);
  if (!order) {
    return { ok: false, code: "NOT_FOUND", message: "주문을 찾을 수 없습니다." };
  }

  if (order.status === nextStatus) {
    return { ok: true, order, unchanged: true };
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", order.id)
    .select("*")
    .single();

  if (error) throw error;

  await supabaseAdmin.from("order_status_log").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: nextStatus,
  });

  return { ok: true, order: data };
}
