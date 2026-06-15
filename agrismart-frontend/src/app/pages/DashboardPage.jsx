import { useEffect, useMemo, useState, lazy, Suspense, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Leaf, ShoppingCart, Package,
  DollarSign, Activity, AlertCircle, Sparkles, ArrowRight,
  BarChart2, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cropService, orderService, priceService } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Lazy-load 3D components
const DataSphere = lazy(() => import('../components/three/DataSphere'));
const CropOrb = lazy(() => import('../components/three/CropOrb'));

// Stagger animation variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stat card with 3D glow effect
function StatCard3D({ icon: Icon, title, value, subtitle, subtitleColor = 'text-green-400', color = 'from-green-500 to-green-600', glowColor = 'rgba(34, 197, 94, 0.2)', index = 0 }) {
  return (
    <motion.div variants={cardVariants}>
      <div
        className="relative glass-dark rounded-2xl p-5 border border-white/8 overflow-hidden group hover:border-green-500/30 transition-all duration-300"
        style={{ boxShadow: `0 4px 30px ${glowColor}` }}
      >
        {/* Gradient background glow on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} opacity-5 rounded-2xl`} />

        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">{title}</p>
            <div className="text-3xl font-black text-white">{value}</div>
          </div>
          <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        <p className={`relative text-xs font-medium ${subtitleColor}`}>{subtitle}</p>

        {/* Bottom shimmer line */}
        <div className="data-stream-line absolute bottom-0 left-0 right-0 h-0.5" />
      </div>
    </motion.div>
  );
}

// Market price row
function PriceRow({ price }) {
  const isUp = price.trend === 'up';
  const isDown = price.trend === 'down';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-xl glass-dark border border-white/5 hover:border-green-500/25 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
          <Leaf className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{price.product}</p>
          <p className="text-xs text-white/40">per {price.unit}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-white">₹{price.currentPrice}</p>
        <div className={`flex items-center gap-1 text-xs justify-end ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-white/40'}`}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(price.change)}%
        </div>
      </div>
    </motion.div>
  );
}

// Custom Recharts tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl p-3 border border-green-500/30 shadow-xl">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-sm font-bold text-green-400">₹{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cropsRes, ordersRes, pricesRes] = await Promise.all([
          cropService.getAllCrops(),
          orderService.getAllOrders(),
          priceService.getLatestPrices(undefined, 6),
        ]);

        const crops = (cropsRes.data?.data || []).map((crop) => ({
          id: crop._id,
          name: crop.cropName,
          variety: crop.variety || 'Unknown',
          quantity: crop.quantity,
          unit: crop.unit || 'kg',
          status: crop.status || 'available',
          image: crop.images?.[0],
        }));

        const orders = (ordersRes.data?.data || []).map((order) => ({
          id: order._id,
          cropName: order.cropId?.cropName || 'Unknown Crop',
          quantity: order.quantity,
          totalAmount: order.totalAmount || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt || new Date().toISOString(),
        }));

        const prices = (pricesRes.data?.data || []).map((record) => {
          const oldValue = record.historicalPrices?.[record.historicalPrices.length - 1]?.price || record.predictedPrice || 0;
          const newValue = record.predictedPrice || 0;
          const change = oldValue ? ((newValue - oldValue) / oldValue) * 100 : 0;
          const trend = record.trend === 'increase' ? 'up' : record.trend === 'decrease' ? 'down' : 'stable';
          return {
            id: record._id,
            product: record.cropName || 'Unknown Crop',
            currentPrice: Number(record.predictedPrice || 0),
            unit: record.unit || 'kg',
            trend,
            change: Number(change.toFixed(2)),
          };
        });

        setRecentCrops(crops.slice(0, 3));
        setRecentOrders(orders.slice(0, 3));
        setMarketPrices(prices.slice(0, 5));

        if (user?.role === 'farmer') {
          const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
          setStats({
            totalCrops: crops.length,
            activeCrops: crops.filter((c) => c.status === 'available').length,
            totalOrders: orders.length,
            revenue,
            revenueChange: 0,
          });
        } else {
          const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
          setStats({
            totalOrders: orders.length,
            activeOrders: orders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
            totalSpent,
            savedAmount: 0,
          });
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load dashboard data');
      }
    };
    loadData();
  }, [user?.role]);

  const chartData = useMemo(() => {
    if (!recentOrders.length) return [];
    const grouped = {};
    recentOrders.forEach((order) => {
      const label = new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short' });
      grouped[label] = (grouped[label] || 0) + order.totalAmount;
    });
    return Object.entries(grouped).map(([name, revenue]) => ({ name, revenue }));
  }, [recentOrders]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 animate-pulse" />
        <p className="text-white/40 text-sm animate-pulse">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">

      {/* ── 3D Hero Welcome Banner ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden border border-green-500/20"
        style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(0,0,0,0.4) 60%, rgba(132,204,22,0.08) 100%)' }}
      >
        {/* DataSphere background */}
        <div className="absolute right-0 top-0 bottom-0 w-72 opacity-70 hidden lg:block">
          <Suspense fallback={null}>
            <DataSphere style={{ width: '100%', height: '100%' }} />
          </Suspense>
        </div>

        <div className="relative z-10 p-7">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">Dashboard Active</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {t('dashboard.welcomeBack')}, <span className="text-shimmer">{user?.name}</span>! 🌱
          </h1>
          <p className="text-white/50 max-w-md">{t('dashboard.manageOps')}</p>

          <div className="flex gap-3 mt-5">
            <Link to="/crops">
              <Button className="bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm gap-2">
                <Leaf className="w-4 h-4" /> Manage Crops
              </Button>
            </Link>
            <Link to="/chatbot">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl text-sm gap-2">
                <Sparkles className="w-4 h-4 text-green-400" /> AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Farmer Stats ─────────────────────────────────────── */}
      {user?.role === 'farmer' && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard3D
              icon={Leaf}
              title={t('dashboard.totalCrops')}
              value={stats.totalCrops}
              subtitle={`${stats.activeCrops} ${t('dashboard.available')}`}
              color="from-emerald-500 to-green-600"
              glowColor="rgba(34,197,94,0.15)"
            />
            <StatCard3D
              icon={ShoppingCart}
              title={t('dashboard.totalOrders')}
              value={stats.totalOrders}
              subtitle={t('dashboard.ordersPlaced')}
              color="from-blue-500 to-cyan-600"
              glowColor="rgba(59,130,246,0.15)"
              subtitleColor="text-blue-400"
            />
            <StatCard3D
              icon={DollarSign}
              title={t('dashboard.revenue')}
              value={`₹${(stats.revenue / 1000).toFixed(0)}K`}
              subtitle={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% change`}
              color="from-amber-500 to-orange-600"
              glowColor="rgba(245,158,11,0.15)"
              subtitleColor="text-amber-400"
            />
            <StatCard3D
              icon={Activity}
              title={t('dashboard.activeCrops')}
              value={stats.activeCrops}
              subtitle={`${stats.totalCrops ? Math.round((stats.activeCrops / stats.totalCrops) * 100) : 0}% active rate`}
              color="from-violet-500 to-purple-600"
              glowColor="rgba(139,92,246,0.15)"
              subtitleColor="text-violet-400"
            />
          </motion.div>

          {/* Progress bar for active crops */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark rounded-2xl p-5 border border-white/8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white/70">Active Crop Rate</span>
              <span className="text-sm font-bold text-green-400">
                {stats.totalCrops ? Math.round((stats.activeCrops / stats.totalCrops) * 100) : 0}%
              </span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.totalCrops ? (stats.activeCrops / stats.totalCrops) * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              />
              <div className="data-stream-line absolute inset-0 h-full rounded-full" />
            </div>
          </motion.div>

          {/* Revenue Chart + CropOrb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Chart */}
            <div className="lg:col-span-2 glass-dark rounded-2xl p-5 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{t('dashboard.revenueOverview')}</h3>
                  <p className="text-xs text-white/40">{t('dashboard.revenueByRecent')}</p>
                </div>
                <BarChart2 className="w-5 h-5 text-green-400" />
              </div>
              {chartData.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">{t('dashboard.noRevenueData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#revenueGrad)"
                      dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#166534' }}
                      activeDot={{ r: 6, fill: '#22c55e', stroke: '#dcfce7' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 3D CropOrb widget */}
            <div className="widget-3d flex flex-col items-center justify-center p-4">
              <div className="w-full h-52">
                <Suspense fallback={<div className="three-loader-orb mx-auto" />}>
                  <CropOrb style={{ width: '100%', height: '100%' }} />
                </Suspense>
              </div>
              <div className="text-center mt-2">
                <div className="text-xs text-green-400 font-semibold uppercase tracking-widest">Crop Health</div>
                <div className="text-2xl font-black text-white mt-1">
                  {stats.activeCrops}/{stats.totalCrops}
                </div>
                <div className="text-xs text-white/40">Active Listings</div>
              </div>
            </div>
          </motion.div>

          {/* Recent crops */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-dark rounded-2xl p-5 border border-white/8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">{t('dashboard.recentCrops')}</h3>
                <p className="text-xs text-white/40">{t('dashboard.latestCropListings')}</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentCrops.map((crop, i) => (
                <motion.div
                  key={crop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl glass-green border border-green-500/15 hover:border-green-400/30 transition-all duration-200"
                >
                  <img
                    src={crop.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400'}
                    alt={crop.name}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{crop.name}</p>
                    <p className="text-xs text-white/40">{crop.variety}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white text-sm">{crop.quantity} {crop.unit}</p>
                    <Badge
                      variant={crop.status === 'available' ? 'default' : 'secondary'}
                      className={`text-xs mt-1 ${crop.status === 'available' ? 'bg-green-600/80 text-green-100' : 'bg-white/10 text-white/60'}`}
                    >
                      {t(`crops.${crop.status}`)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/crops">
              <Button variant="outline" className="w-full mt-4 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl gap-2">
                {t('dashboard.viewAllCrops')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </>
      )}

      {/* ── Buyer Stats ──────────────────────────────────────── */}
      {user?.role === 'buyer' && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard3D
              icon={ShoppingCart}
              title={t('dashboard.totalOrders')}
              value={stats.totalOrders}
              subtitle={`${stats.activeOrders} ${t('dashboard.activeOrdersHelper')}`}
              color="from-blue-500 to-cyan-600"
              glowColor="rgba(59,130,246,0.15)"
              subtitleColor="text-blue-400"
            />
            <StatCard3D
              icon={Package}
              title={t('dashboard.activeOrders')}
              value={stats.activeOrders}
              subtitle={t('dashboard.pendingOrPaid')}
              color="from-violet-500 to-purple-600"
              glowColor="rgba(139,92,246,0.15)"
              subtitleColor="text-violet-400"
            />
            <StatCard3D
              icon={DollarSign}
              title={t('dashboard.totalSpent')}
              value={`₹${(stats.totalSpent / 1000).toFixed(0)}K`}
              subtitle={t('dashboard.allTime')}
              color="from-amber-500 to-orange-600"
              glowColor="rgba(245,158,11,0.15)"
              subtitleColor="text-amber-400"
            />
            <StatCard3D
              icon={TrendingDown}
              title={t('dashboard.savings')}
              value={`₹${(stats.savedAmount / 1000).toFixed(0)}K`}
              subtitle={t('dashboard.savedThrough')}
              color="from-emerald-500 to-green-600"
              glowColor="rgba(34,197,94,0.15)"
            />
          </motion.div>

          {/* Recent orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark rounded-2xl p-5 border border-white/8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">{t('dashboard.recentOrders')}</h3>
                <p className="text-xs text-white/40">{t('dashboard.latestPurchase')}</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl glass-dark border border-white/8 hover:border-green-500/20 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-white text-sm">{order.cropName}</p>
                    <p className="text-xs text-white/40">
                      {order.quantity} {t('crops.quantity')} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">₹{order.totalAmount.toLocaleString()}</p>
                    <Badge
                      className={`text-xs mt-1 ${order.status === 'paid' ? 'bg-green-600/80 text-green-100' : 'bg-white/10 text-white/60'}`}
                    >
                      {t(`orders.status.${order.status}`)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/orders">
              <Button variant="outline" className="w-full mt-4 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl gap-2">
                {t('dashboard.viewAllOrders')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </>
      )}

      {/* ── Market Prices + DataSphere ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Prices list */}
        <div className="lg:col-span-2 glass-dark rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white">{t('dashboard.marketPrices')}</h3>
              <p className="text-xs text-white/40">{t('dashboard.currentRates')}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-2">
            {marketPrices.map((price, i) => (
              <PriceRow key={price.id} price={price} />
            ))}
          </div>
          <Link to="/prices">
            <Button variant="outline" className="w-full mt-4 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl gap-2">
              {t('dashboard.latestPrices')} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 3D DataSphere */}
        <div className="widget-3d flex flex-col items-center justify-center p-4">
          <div className="w-full h-52">
            <Suspense fallback={<div className="three-loader-orb mx-auto" />}>
              <DataSphere style={{ width: '100%', height: '100%' }} />
            </Suspense>
          </div>
          <div className="text-center mt-3">
            <div className="text-xs text-green-400 font-semibold uppercase tracking-widest">Data Network</div>
            <div className="text-lg font-black text-white mt-1">Live Market</div>
            <div className="text-xs text-white/40">AI-powered insights</div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="glass-dark rounded-2xl p-5 border border-white/8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-white">{t('dashboard.quickActions')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/crops',   icon: Leaf,          label: t('dashboard.manageCrops'),  color: 'from-emerald-500 to-green-600' },
            { to: '/orders',  icon: ShoppingCart,  label: t('dashboard.viewOrdersBtn'), color: 'from-blue-500 to-cyan-600' },
            { to: '/weather', icon: AlertCircle,   label: t('dashboard.checkWeather'), color: 'from-sky-500 to-blue-600' },
            { to: '/chatbot', icon: Sparkles,      label: t('dashboard.aiAssistant'),  color: 'from-violet-500 to-purple-600' },
          ].map(({ to, icon: Icon, label, color }, i) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative glass-green rounded-2xl p-4 border border-white/8 hover:border-green-400/30 transition-all duration-200 text-center overflow-hidden group h-24 flex flex-col items-center justify-center gap-2"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">{label}</span>
                <div className="data-stream-line absolute bottom-0 left-0 right-0 h-0.5" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
