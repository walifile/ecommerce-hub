import type { Expense, Order } from "@/lib/ecommerce-data";

export type ProfitCategory = "realized" | "projected" | "returned" | "cancelled";

export type OrderProfitBreakdown = {
  order: Order;
  category: ProfitCategory;
  reportDate: string;
  revenue: number;
  refund: number;
  productCost: number;
  shippingCost: number;
  adCost: number;
  profit: number;
};

const roundMoney = (value: number) => Number(value.toFixed(2));

function latestEventDate(order: Order, status: string) {
  return order.events
    ?.slice()
    .reverse()
    .find((event) => event.newStatus === status)
    ?.createdAt.slice(0, 10);
}

export function getOrderProfitBreakdown(order: Order): OrderProfitBreakdown {
  const originalProductCost = order.items.reduce(
    (sum, item) => sum + item.productCost * item.quantity,
    0
  );

  if (order.status === "cancelled") {
    return {
      order,
      category: "cancelled",
      reportDate: order.reversedAt?.slice(0, 10) || latestEventDate(order, "cancelled") || order.createdAt,
      revenue: 0,
      refund: Math.max(0, order.refundAmount ?? 0),
      productCost: 0,
      shippingCost: 0,
      adCost: 0,
      profit: 0,
    };
  }

  if (order.status === "returned") {
    // Returned inventory is restored by the order-status transaction, so COGS
    // is reversed. Shipping and acquisition cost remain incurred.
    const refund = Math.min(order.revenue, Math.max(0, order.refundAmount ?? order.revenue));
    const revenue = Math.max(0, order.revenue - refund);
    const profit = revenue - order.shippingCost - order.adCost;
    return {
      order,
      category: "returned",
      reportDate: order.reversedAt?.slice(0, 10) || latestEventDate(order, "returned") || order.createdAt,
      revenue: roundMoney(revenue),
      refund: roundMoney(refund),
      productCost: 0,
      shippingCost: order.shippingCost,
      adCost: order.adCost,
      profit: roundMoney(profit),
    };
  }

  const category: ProfitCategory = order.status === "delivered" ? "realized" : "projected";
  const profit = order.revenue - originalProductCost - order.shippingCost - order.adCost;
  return {
    order,
    category,
    reportDate:
      category === "realized"
        ? latestEventDate(order, "delivered") || order.createdAt
        : order.createdAt,
    revenue: order.revenue,
    refund: 0,
    productCost: roundMoney(originalProductCost),
    shippingCost: order.shippingCost,
    adCost: order.adCost,
    profit: roundMoney(profit),
  };
}

export function summarizeProfit(rows: OrderProfitBreakdown[], expenses: Expense[]) {
  const revenue = roundMoney(rows.reduce((sum, row) => sum + row.revenue, 0));
  const refunds = roundMoney(rows.reduce((sum, row) => sum + row.refund, 0));
  const productCost = roundMoney(rows.reduce((sum, row) => sum + row.productCost, 0));
  const shippingCost = roundMoney(rows.reduce((sum, row) => sum + row.shippingCost, 0));
  const adCost = roundMoney(rows.reduce((sum, row) => sum + row.adCost, 0));
  const orderProfit = roundMoney(rows.reduce((sum, row) => sum + row.profit, 0));
  const operatingExpenses = roundMoney(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const netProfit = roundMoney(orderProfit - operatingExpenses);
  return {
    revenue,
    refunds,
    productCost,
    shippingCost,
    adCost,
    orderProfit,
    operatingExpenses,
    netProfit,
    margin: revenue > 0 ? roundMoney((netProfit / revenue) * 100) : 0,
  };
}

export function formatProfitCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
