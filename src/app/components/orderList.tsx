"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Link from "next/link";

export default function OrdersList() {
  const orders = useSelector((state: RootState) => state.order.orders);

  return (
    <main className="max-w-7xl mx-auto px-e bg-white px-4 sm:px-4 lg:px-8 py-10 pt-20 sm:pt-24">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 text-lg border border-dashed border-gray-300 p-8 rounded-md shadow-sm bg-white">
          No orders placed yet.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-6 py-4">Order ID</th>
                  <th className="text-left px-6 py-4">Customer</th>
                  <th className="text-center px-6 py-4">Items</th>
                  <th className="text-right px-6 py-4">Total</th>
                  <th className="text-right px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 text-center">
                      {order.totalItems}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-sm">
                      {new Date(order.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
