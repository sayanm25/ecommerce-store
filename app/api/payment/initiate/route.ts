import { NextResponse } from "next/server";
import {
  getSabPaisaConfig,
  buildRequestString,
  encrypt,
  newClientTxnId,
} from "@/lib/sabpaisa";
import { computeTotals, CartLine } from "@/lib/pricing";
import { createPendingOrder } from "@/lib/orders";

/**
 * POST /api/payment/initiate
 *
 * Body: {
 *   items: { id: number, quantity: number }[],
 *   name: string, email: string, mobile: string
 * }
 *
 * Returns { gatewayUrl, clientCode, encData, clientTxnId } for the
 * browser to POST to SabPaisa. The order total is recomputed here from
 * the catalog — the client never gets to set the price.
 *
 * Returns 503 when credentials aren't configured (demo fallback).
 */
export async function POST(request: Request) {
  const config = getSabPaisaConfig();
  if (!config) {
    return NextResponse.json(
      { error: "not_configured", message: "SabPaisa credentials are not set." },
      { status: 503 }
    );
  }

  let body: {
    items?: CartLine[];
    name?: string;
    email?: string;
    mobile?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { items, name, email, mobile } = body;
  if (!Array.isArray(items) || items.length === 0 || !name || !email || !mobile) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Authoritative, server-side total. Rejects unknown product ids.
  let total: number;
  try {
    total = computeTotals(items).total;
  } catch {
    return NextResponse.json({ error: "invalid_items" }, { status: 400 });
  }
  if (total <= 0) {
    return NextResponse.json({ error: "empty_order" }, { status: 400 });
  }

  const clientTxnId = newClientTxnId();
  createPendingOrder(clientTxnId, total);

  const requestString = buildRequestString(config, {
    clientTxnId,
    amount: total,
    payerName: name,
    payerEmail: email,
    payerMobile: mobile,
  });

  const encData = encrypt(requestString, config.authKey, config.authIv);

  return NextResponse.json({
    gatewayUrl: config.gatewayUrl,
    clientCode: config.clientCode,
    encData,
    clientTxnId,
  });
}
