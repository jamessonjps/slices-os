import { fakeReports } from '@/mocks/fakeReports';
import { orderService } from '@/services/orderService';

export const reportService = {
  listReports: async () => {
    return [...fakeReports];
  },
  listOrdersForReports: async () => {
    return orderService.listOrders();
  },
  getDailySummary: async () => {
    const orders = await orderService.listOrders();
    const summary = orders.reduce(
      (acc, order) => {
        acc.totalOrders += 1;
        acc.totalRevenue += order.total_amount || 0;
        if (order.status === 'pending') acc.pendingOrders += 1;
        if (order.status === 'ready') acc.readyOrders += 1;
        if (order.status === 'delivering') acc.deliveringOrders += 1;
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, readyOrders: 0, deliveringOrders: 0 }
    );
    return summary;
  }
};
