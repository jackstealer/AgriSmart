import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Leaf, Calculator, Sparkles, BarChart2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { priceService } from '../services/api';
import { toast } from 'sonner';

// Custom chart tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl p-3 border border-green-500/30 shadow-xl">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export const PricesPage = () => {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictForm, setPredictForm] = useState({
    crop: 'Wheat', state: 'Punjab',
    month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    rainfall_mm: 100, temperature_c: 30, demand_index: 1.0, inflation_rate: 5.5,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await priceService.getLatestPrices(undefined, 12);
        const mapped = (response.data?.data || []).map((record) => {
          const history = record.historicalPrices || [];
          const latestHistorical = history[history.length - 1];
          const oldValue = latestHistorical?.price || record.predictedPrice || 0;
          const newValue = record.predictedPrice || 0;
          const change = oldValue ? ((newValue - oldValue) / oldValue) * 100 : 0;
          const trend = record.trend === 'increase' ? 'up' : record.trend === 'decrease' ? 'down' : 'stable';
          return {
            id: record._id,
            product: record.cropName || 'Unknown Crop',
            currentPrice: Number(record.predictedPrice || 0),
            unit: record.unit || 'quintal',
            trend, change: Number(change.toFixed(2)),
            historicalPrices: history,
          };
        });
        setPrices(mapped);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load prices');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handlePredictPrice = async () => {
    try {
      setIsPredicting(true);
      const response = await priceService.predictPrice(predictForm);
      setPrediction(response.data.data);
      toast.success('Price predicted successfully!');
    } catch (error) {
      toast.error('Failed to predict price');
    } finally {
      setIsPredicting(false);
    }
  };

  const crops = ['Wheat', 'Rice', 'Maize', 'Potato', 'Tomato', 'Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Chilli', 'Gram', 'Mustard'];
  const states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal'];

  const chartData = useMemo(() => {
    const series = prices.slice(0, 3);
    if (!series.length) return [];
    const labels = new Set();
    series.forEach((item) => {
      (item.historicalPrices || []).forEach((point) => {
        labels.add(new Date(point.date).toLocaleDateString('en-IN', { month: 'short' }));
      });
    });
    return Array.from(labels).map((label) => {
      const entry = { month: label };
      series.forEach((item) => {
        const point = (item.historicalPrices || []).find(
          (p) => new Date(p.date).toLocaleDateString('en-IN', { month: 'short' }) === label
        );
        entry[item.product] = point?.price || null;
      });
      return entry;
    });
  }, [prices]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 animate-pulse" />
        <p className="text-white/40 animate-pulse text-sm">Loading prices...</p>
      </div>
    );
  }

  const chartColors = ['#22c55e', '#84cc16', '#f59e0b'];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Market Prices</h1>
        <p className="text-white/50 mt-1">Real-time market prices and AI-powered predictions</p>
      </div>

      {/* AI Price Predictor */}
      <div className="glass-dark rounded-2xl p-6 border border-white/8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Price Predictor</h2>
            <p className="text-xs text-white/40">Predict future crop prices using ML model</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Crop</Label>
            <Select value={predictForm.crop} onValueChange={(v) => setPredictForm({ ...predictForm, crop: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                {crops.map((c) => <SelectItem key={c} value={c} className="text-white hover:bg-white/10">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">State</Label>
            <Select value={predictForm.state} onValueChange={(v) => setPredictForm({ ...predictForm, state: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                {states.map((s) => <SelectItem key={s} value={s} className="text-white hover:bg-white/10">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Rainfall (mm)</Label>
            <Input type="number" value={predictForm.rainfall_mm} onChange={(e) => setPredictForm({ ...predictForm, rainfall_mm: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Temperature (°C)</Label>
            <Input type="number" value={predictForm.temperature_c} onChange={(e) => setPredictForm({ ...predictForm, temperature_c: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-5">
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Month</Label>
            <Input type="number" min="1" max="12" value={predictForm.month} onChange={(e) => setPredictForm({ ...predictForm, month: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Year</Label>
            <Input type="number" value={predictForm.year} onChange={(e) => setPredictForm({ ...predictForm, year: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Demand Index</Label>
            <Input type="number" step="0.1" value={predictForm.demand_index} onChange={(e) => setPredictForm({ ...predictForm, demand_index: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Inflation Rate (%)</Label>
            <Input type="number" step="0.1" value={predictForm.inflation_rate} onChange={(e) => setPredictForm({ ...predictForm, inflation_rate: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
          </div>
        </div>

        <Button
          onClick={handlePredictPrice}
          disabled={isPredicting}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 rounded-xl gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isPredicting ? 'Predicting...' : 'Predict Price'}
        </Button>

        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-5 glass-green rounded-2xl border border-green-500/30"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/50 mb-1">Predicted Price</p>
                <p className="text-4xl font-black text-shimmer">₹{prediction.predicted_price}</p>
                <p className="text-sm text-white/40 mt-1">per {prediction.unit || 'quintal'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Trend</p>
                <p className={`text-2xl font-bold ${prediction.trend === 'increase' ? 'text-green-400' : prediction.trend === 'decrease' ? 'text-red-400' : 'text-white/60'}`}>
                  {prediction.trend?.toUpperCase()}
                </p>
                <p className="text-sm text-white/50 mt-2">{prediction.insights}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-500/20 flex gap-6 text-sm">
              <span className="text-white/50">Season: <span className="text-white">{prediction.season || 'N/A'}</span></span>
              <span className="text-white/50">Confidence: <span className="text-green-400">{prediction.confidence ? `${(prediction.confidence * 100).toFixed(0)}%` : 'N/A'}</span></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Price Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {prices.map((price, index) => (
          <motion.div
            key={price.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <div className="relative glass-dark rounded-2xl p-5 border border-white/8 hover:border-green-500/30 transition-all duration-300 group overflow-hidden">
              <div className="data-stream-line absolute bottom-0 left-0 right-0 h-0.5" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${
                  price.trend === 'up'
                    ? 'bg-green-500/15 text-green-400'
                    : price.trend === 'down'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-white/8 text-white/50'
                }`}>
                  {price.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(price.change)}%
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-0.5">{price.product}</h3>
              <p className="text-xs text-white/40 mb-3">per {price.unit}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-shimmer">₹{price.currentPrice.toLocaleString()}</span>
                <span className="text-sm text-white/40">/{price.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price Trends Chart */}
      <div className="glass-dark rounded-2xl p-5 border border-white/8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="font-bold text-white">Price Trends</h3>
            <p className="text-xs text-white/40">Historical price trends from recent data points</p>
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-10">No historical price data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                {prices.slice(0, 3).map((item, i) => (
                  <linearGradient key={item.id} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              {prices.slice(0, 3).map((item, idx) => (
                <Area
                  key={item.id}
                  type="monotone"
                  dataKey={item.product}
                  stroke={chartColors[idx]}
                  strokeWidth={2}
                  fill={`url(#grad-${idx})`}
                  connectNulls
                  dot={{ fill: chartColors[idx], r: 3 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
