import { NextResponse } from "next/server";
import {
  getSabPaisaConfig,
  decrypt,
  parseResponseString,
} from "@/lib/sabpaisa";
import { getOrder, markOrderPaid, markOrderFailed } from "@/lib/orders";

/**
 * POST /api/payment/callback
 *
 * SabPaisa redirects the customer's browser here with an encrypted
 * `encResponse` (form-url-encoded) after payment. We decrypt it, read
 * the status, and 303-redirect the browser to a result page.
 *
 * ⚠️  Verify the response field name (`encResponse` vs `encData` vs ...)
 *     and the success status value against your SabPaisa kit.
 */
export async function POST(request: Request) {
  const config = getSabPaisaConfig();
  const base = config?.baseUrl || "http://localhost:3000";

  if (!config) {
    return NextResponse.redirect(
      `${base}/checkout/result?status=error&reason=not_configured`,
      { status: 303 }
    );
  }

  try {
    const form = await request.formData();
    const encResponse =
      (form.get("encResponse") as string) ||
      (form.get("encData") as string) ||
      "";

    if (!encResponse) {
      return NextResponse.redirect(
        `${base}/checkout/result?status=error&reason=empty_response`,
        { status: 303 }
      );
    }

    const decrypted = decrypt(encResponse, config.authKey, config.authIv);
    const result = parseResponseString(decrypted);

    // Reconcile against the pending order: the gateway must report SUCCESS
    // AND the paid amount must match what we recorded at initiation.
    const order = result.clientTxnId ? getOrder(result.clientTxnId) : undefined;
    const paidAmount = result.amount ? Number(result.amount) : NaN;
    const amountMatches =
      !!order && Math.round(paidAmount) === Math.round(order.amount);
    const success = result.status === "SUCCESS" && amountMatches;

    if (result.clientTxnId) {
      if (success) {
        markOrderPaid(result.clientTxnId, result.sabpaisaTxnId);
      } else {
        markOrderFailed(result.clientTxnId);
      }
    }

    const params = new URLSearchParams({
      status: success ? "success" : "failed",
      txn: result.sabpaisaTxnId || result.clientTxnId || "",
      gateway_status: result.status,
    });
    if (result.status === "SUCCESS" && !amountMatches) {
      params.set("reason", "amount_mismatch");
    }

    return NextResponse.redirect(
      `${base}/checkout/result?${params.toString()}`,
      { status: 303 }
    );
  } catch {
    return NextResponse.redirect(
      `${base}/checkout/result?status=error&reason=decrypt_failed`,
      { status: 303 }
    );
  }
}
