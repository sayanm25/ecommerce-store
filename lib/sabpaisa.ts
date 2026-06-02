/**
 * SabPaisa payment-gateway helper — SERVER ONLY.
 *
 * Do not import this from a client component: it uses Node's `crypto`
 * and reads secret credentials from the environment.
 *
 * Integration model (server-side redirect flow):
 *   1. Build a query-style request string from the order details.
 *   2. AES-encrypt it with the merchant's auth key + IV  -> `encData`.
 *   3. The browser POSTs { encData, clientCode } to SABPAISA_GATEWAY_URL.
 *   4. SabPaisa processes payment and POSTs an encrypted `encResponse`
 *      back to our callback URL.
 *   5. We decrypt `encResponse` and read the transaction status.
 *
 * ⚠️  Field names and the exact encryption parameters vary across
 *     SabPaisa integration-kit versions. Cross-check `REQUEST_FIELDS`,
 *     the cipher, and the response keys against your own kit.
 */
import crypto from "crypto";

export interface SabPaisaConfig {
  clientCode: string;
  username: string;
  password: string;
  authKey: string;
  authIv: string;
  gatewayUrl: string;
  baseUrl: string;
}

/**
 * Read + validate config from the environment. Returns `null` (rather
 * than throwing) when not configured, so the app can fall back to a
 * demo flow until real credentials are added.
 */
export function getSabPaisaConfig(): SabPaisaConfig | null {
  const {
    SABPAISA_CLIENT_CODE,
    SABPAISA_USERNAME,
    SABPAISA_PASSWORD,
    SABPAISA_AUTH_KEY,
    SABPAISA_AUTH_IV,
    SABPAISA_GATEWAY_URL,
    NEXT_PUBLIC_BASE_URL,
  } = process.env;

  if (
    !SABPAISA_CLIENT_CODE ||
    !SABPAISA_USERNAME ||
    !SABPAISA_PASSWORD ||
    !SABPAISA_AUTH_KEY ||
    !SABPAISA_AUTH_IV ||
    !SABPAISA_GATEWAY_URL
  ) {
    return null;
  }

  return {
    clientCode: SABPAISA_CLIENT_CODE,
    username: SABPAISA_USERNAME,
    password: SABPAISA_PASSWORD,
    authKey: SABPAISA_AUTH_KEY,
    authIv: SABPAISA_AUTH_IV,
    gatewayUrl: SABPAISA_GATEWAY_URL,
    baseUrl: NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  };
}

/** Pick the AES variant from the key length (16/24/32 bytes). */
function cipherFor(key: string): string {
  switch (Buffer.from(key, "utf8").length) {
    case 16:
      return "aes-128-cbc";
    case 24:
      return "aes-192-cbc";
    case 32:
      return "aes-256-cbc";
    default:
      throw new Error(
        `SABPAISA_AUTH_KEY must be 16, 24, or 32 bytes (got ${
          Buffer.from(key, "utf8").length
        }). Check your SabPaisa kit.`
      );
  }
}

export function encrypt(plain: string, key: string, iv: string): string {
  const cipher = crypto.createCipheriv(
    cipherFor(key),
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8")
  );
  return cipher.update(plain, "utf8", "base64") + cipher.final("base64");
}

export function decrypt(encB64: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    cipherFor(key),
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8")
  );
  return decipher.update(encB64, "base64", "utf8") + decipher.final("utf8");
}

export interface OrderDetails {
  clientTxnId: string;
  amount: number; // in rupees
  payerName: string;
  payerEmail: string;
  payerMobile: string;
}

/**
 * Build the SabPaisa request string. The set/order of fields is
 * mandated by SabPaisa — verify against your kit.
 */
export function buildRequestString(
  config: SabPaisaConfig,
  order: OrderDetails
): string {
  const callbackUrl = `${config.baseUrl}/api/payment/callback`;

  // NOTE: amount is sent with 2 decimals (e.g. "4999.00"). Confirm the
  // expected format with SabPaisa.
  const fields: Record<string, string> = {
    payerName: order.payerName,
    payerEmail: order.payerEmail,
    payerMobile: order.payerMobile,
    clientTxnId: order.clientTxnId,
    amount: order.amount.toFixed(2),
    clientCode: config.clientCode,
    transUserName: config.username,
    transUserPassword: config.password,
    callbackUrl,
    channelId: "W", // W = Web. Verify.
    mcc: "5311", // Merchant category code. Verify with SabPaisa.
    amountType: "INR",
  };

  return Object.entries(fields)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export interface PaymentResult {
  status: string; // e.g. "SUCCESS" | "FAILED" | "ABORTED"
  clientTxnId?: string;
  sabpaisaTxnId?: string;
  amount?: string;
  raw: Record<string, string>;
}

/** Parse the decrypted callback string ("a=b&c=d") into a result. */
export function parseResponseString(decrypted: string): PaymentResult {
  const raw: Record<string, string> = {};
  for (const pair of decrypted.split("&")) {
    const [k, ...rest] = pair.split("=");
    if (k) raw[k] = rest.join("=");
  }

  return {
    // Response key names vary — adjust to match your kit.
    status: (raw.status || raw.statusCode || "UNKNOWN").toUpperCase(),
    clientTxnId: raw.clientTxnId,
    sabpaisaTxnId: raw.sabpaisaTxnId,
    amount: raw.amount || raw.paidAmount,
    raw,
  };
}

/** Generate a unique client transaction id for an order. */
export function newClientTxnId(): string {
  return `SN-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
}
