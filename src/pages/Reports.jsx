import React, { useState } from 'react';
import { orderService } from '@/services/orderService';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, DollarSign, ShoppingBag, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-report'],
    queryFn: () => orderService.listOrders('-created_date', 1000)
  });

  const getDateRange = () => {
    const now = new Date();
    if (period === 'custom' && customStart && customEnd) {
      const start = parseISO(customStart);
      const end = parseISO(customEnd);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return { start: startOfDay(start), end: endOfDay(end) };
      }
    }
    switch (period) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();
  
  const filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.created_date);
    return isWithinInterval(orderDate, { start, end }) && o.status !== 'cancelled';
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Products sold
  const productStats = {};
  filteredOrders.forEach(order => {
    order.pizzas?.forEach(pizza => {
      const key = `${pizza.flavor1} (${pizza.size}f)`;
      if (!productStats[key]) productStats[key] = { name: key, count: 0 };
      productStats[key].count += 1;
    });
    order.drinks?.forEach(drink => {
      const key = drink.name;
      if (!productStats[key]) productStats[key] = { name: key, count: 0 };
      productStats[key].count += drink.quantity;
    });
  });

  const productArray = Object.values(productStats).sort((a, b) => b.count - a.count);
  const topProducts = productArray.slice(0, 5);
  const leastProducts = productArray.slice(-5).reverse();

  // Peak hours
  const hourStats = Array(24).fill(0).map((_, i) => ({ hour: i, orders: 0 }));
  filteredOrders.forEach(order => {
    const hour = new Date(order.created_date).getHours();
    hourStats[hour].orders += 1;
  });

  const peakHours = hourStats
    .filter(h => h.orders > 0)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Revenue by day
  const revenueByDay = {};
  filteredOrders.forEach(order => {
    const day = format(new Date(order.created_date), 'dd/MM');
    if (!revenueByDay[day]) revenueByDay[day] = 0;
    revenueByDay[day] += order.total_amount || 0;
  });
  const revenueData = Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue }));

  // Delivery types
  const deliveryStats = filteredOrders.reduce((acc, o) => {
    const type = o.delivery_type === 'delivery' ? 'Entrega' : 'Retirada';
    if (!acc[type]) acc[type] = 0;
    acc[type] += 1;
    return acc;
  }, {});
  const deliveryData = Object.entries(deliveryStats).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminHome')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Relatórios de Vendas</h1>
                <p className="text-sm text-slate-500">Análise detalhada do período</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <Card className="p-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label>Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === 'custom' && (
              <>
                <div className="flex-1 min-w-[150px]">
                  <Label>Data Início</Label>
                  <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Label>Data Fim</Label>
                  <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Faturamento</p>
                <p className="text-2xl font-bold text-slate-900">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pedidos Concluídos</p>
                <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ticket Médio</p>
                <p className="text-2xl font-bold text-slate-900">R$ {avgTicket.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="p-4">
          <h3 className="font-semibold text-slate-900 mb-4">Faturamento por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" name="Faturamento (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Products */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Least Products */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Produtos Menos Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leastProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Peak Hours */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Horários de Pico</h3>
            <div className="space-y-3">
              {peakHours.map((h, i) => (
                <div key={h.hour} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{h.hour}:00 - {h.hour + 1}:00</p>
                      <p className="text-sm text-slate-500">{h.orders} pedidos</p>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Types */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Tipos de Entrega</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
