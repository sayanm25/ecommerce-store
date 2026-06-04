import {
  getSabPaisaConfig,
  decrypt,
  encrypt,
} from "@/lib/sabpaisa";

/**
 * 🧪 MOCK SABPAISA GATEWAY — local development only.
 *
 * This stands in for SabPaisa's hosted payment page so you can run the
 * full payment loop without real credentials or a public callback URL.
 *
 * To use it, point the gateway URL at this route in `.env.local`:
 *   SABPAISA_GATEWAY_URL=http://localhost:3000/api/payment/mock-gateway
 *
 * Flow:
 *   1. Checkout auto-POSTs { clientCode, encData } here (as the real
 *      gateway would). We decrypt encData and show a fake pay page.
 *   2. You choose Success / Failure (and can tamper the amount to see
 *      the callback's reconciliation reject it).
 *   3. We encrypt a SabPaisa-style response and auto-POST it to the
 *      real /api/payment/callback, exactly like SabPaisa would.
 *
 * It refuses to run in production.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Mock gateway is disabled in production.", {
      status: 404,
    });
  }

  const config = getSabPaisaConfig();
  if (!config) {
    return html(
      errorPage(
        "SabPaisa env not configured. Set the SABPAISA_* vars in .env.local."
      )
    );
  }

  const form = await request.formData();
  const action = form.get("action");

  // ── Step 2: user picked an outcome → build + post the callback ──
  if (action === "complete") {
    const result = String(form.get("result") || "FAILED"); // SUCCESS | FAILED
    const clientTxnId = String(form.get("clientTxnId") || "");
    const amount = String(form.get("amount") || "0");
    const sabpaisaTxnId = `MOCK-${Date.now()}`;

    // Mirror SabPaisa's response shape (verify keys against your kit).
    const responseString = [
      `status=${result}`,
      `clientTxnId=${clientTxnId}`,
      `sabpaisaTxnId=${sabpaisaTxnId}`,
      `amount=${amount}`,
    ].join("&");

    const encResponse = encrypt(
      responseString,
      config.authKey,
      config.authIv
    );
    const callbackUrl = `${config.baseUrl}/api/payment/callback`;
    return html(autoPostPage(callbackUrl, { encResponse }));
  }

  // ── Step 1: decrypt the incoming request and show the pay page ──
  const encData = String(form.get("encData") || "");
  if (!encData) {
    return html(errorPage("No encData received from checkout."));
  }

  let fields: Record<string, string>;
  try {
    const decrypted = decrypt(encData, config.authKey, config.authIv);
    fields = Object.fromEntries(
      decrypted.split("&").map((p) => {
        const [k, ...rest] = p.split("=");
        return [k, rest.join("=")];
      })
    );
  } catch (e) {
    // This is the single most common real-world failure: key/IV/padding
    // mismatch between your app and the gateway.
    return html(
      errorPage(
        `Could not decrypt encData — usually a key/IV/padding mismatch.<br><code>${
          (e as Error).message
        }</code>`
      )
    );
  }

  return html(payPage(fields));
}

// ─────────────────────────── HTML helpers ───────────────────────────

function html(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const shell = (inner: string) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mock SabPaisa</title>
<style>
  body{font-family:-apple-system,system-ui,sans-serif;background:#f5f5f7;color:#1d1d1f;
       display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{background:#fff;border-radius:18px;padding:32px;max-width:420px;width:90%;
        box-shadow:0 8px 30px rgba(0,0,0,.08)}
  h1{font-size:20px;margin:0 0 4px} .tag{color:#6e6e73;font-size:13px;margin:0 0 20px}
  .row{display:flex;justify-content:space-between;font-size:14px;padding:6px 0;border-bottom:1px solid #eee}
  label{display:block;font-size:13px;color:#6e6e73;margin:16px 0 4px}
  input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #d2d2d7;border-radius:8px;font-size:14px}
  .btns{display:flex;gap:10px;margin-top:22px}
  button{flex:1;padding:11px;border:0;border-radius:999px;font-size:14px;color:#fff;cursor:pointer}
  .ok{background:#0071e3} .fail{background:#e0245e}
  code{background:#f5f5f7;padding:2px 5px;border-radius:5px;font-size:12px}
</style></head><body><div class="card">${inner}</div></body></html>`;

function payPage(f: Record<string, string>) {
  const amount = f.amount || "0";
  const txn = f.clientTxnId || "";
  const completeForm = (result: string, cls: string, text: string) => `
    <form method="POST" action="/api/payment/mock-gateway" style="flex:1;margin:0">
      <input type="hidden" name="action" value="complete">
      <input type="hidden" name="result" value="${result}">
      <input type="hidden" name="clientTxnId" value="${txn}">
      <input type="hidden" name="amount" id="amt-${result}">
      <button class="${cls}" type="submit"
        onclick="document.getElementById('amt-${result}').value=document.getElementById('amount').value">${text}</button>
    </form>`;

  return shell(`
    <h1>🧪 Mock SabPaisa</h1>
    <p class="tag">Fake payment page — local testing only</p>
    <div class="row"><span>Payer</span><span>${f.payerName || "—"}</span></div>
    <div class="row"><span>Email</span><span>${f.payerEmail || "—"}</span></div>
    <div class="row"><span>Txn ID</span><span>${txn}</span></div>
    <label for="amount">Amount sent to gateway (₹) — edit to test tampering</label>
    <input id="amount" value="${amount}">
    <div class="btns">
      ${completeForm("SUCCESS", "ok", "Pay (Success)")}
      ${completeForm("FAILED", "fail", "Fail")}
    </div>`);
}

function autoPostPage(action: string, fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`)
    .join("");
  return shell(`
    <h1>Returning to store…</h1>
    <p class="tag">Posting the encrypted result back to your callback.</p>
    <form id="f" method="POST" action="${action}">${inputs}</form>
    <script>document.getElementById('f').submit()</script>`);
}

function errorPage(message: string) {
  return shell(`<h1>⚠️ Mock gateway error</h1><p class="tag">${message}</p>`);
}
