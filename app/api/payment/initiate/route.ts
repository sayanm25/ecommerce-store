import { NextResponse } from "next/server";
import {
  getSabPaisaConfig,
  buildRequestString,
  encrypt,
  newClientTxnId,
} from "@/lib/sabpaisa";

/**
 * POST /api/payment/initiate
 *
 * Body: { amount: number, name: string, email: string, mobile: string }
 *
 * Returns the data the browser needs to POST to SabPaisa:
 *   { gatewayUrl, clientCode, encData, clientTxnId }
 *
 * If credentials are not configured, returns 503 so the client can
 * fall back to the demo confirmation flow.
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
    amount?: number;
    name?: string;
    email?: string;
    mobile?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { amount, name, email, mobile } = body;
  if (!amount || amount <= 0 || !name || !email || !mobile) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // TODO(security): do NOT trust the amount from the client. In a real
  // integration, recompute the order total server-side from the cart's
  // product IDs (and persist a pending order) before encrypting.
  const clientTxnId = newClientTxnId();

  const requestString = buildRequestString(config, {
    clientTxnId,
    amount,
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
