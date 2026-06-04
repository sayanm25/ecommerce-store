/**
 * Pending-order store — SERVER ONLY.
 *
 * An order is created (status "pending") when payment is initiated, then
 * reconciled to "paid"/"failed" in the gateway callback. This lets us
 * verify the paid amount against what we actually charged.
 *
 * ⚠️  This is an in-memory Map: fine for local dev, but it does NOT
 *     survive restarts and is NOT shared across serverless instances.
 *     For production, swap the body of these functions for a real
 *     datastore (Postgres, Redis, etc.). The interface can stay the same.
 */

export type OrderStatus = "pending" | "paid" | "failed";

export interface Order {
  clientTxnId: string;
  amount: number; // authoritative total in rupees
  status: OrderStatus;
  createdAt: number;
  sabpaisaTxnId?: string;
}

const orders = new Map<string, Order>();

export function createPendingOrder(clientTxnId: string, amount: number): Order {
  const order: Order = {
    clientTxnId,
    amount,
    status: "pending",
    createdAt: Date.now(),
  };
  orders.set(clientTxnId, order);
  return order;
}

export function getOrder(clientTxnId: string): Order | undefined {
  return orders.get(clientTxnId);
}

export function markOrderPaid(clientTxnId: string, sabpaisaTxnId?: string) {
  const order = orders.get(clientTxnId);
  if (order) {
    order.status = "paid";
    order.sabpaisaTxnId = sabpaisaTxnId;
  }
  return order;
}

export function markOrderFailed(clientTxnId: string) {
  const order = orders.get(clientTxnId);
  if (order) order.status = "failed";
  return order;
}
