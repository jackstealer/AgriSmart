import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Leaf, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { priceService } from '../services/api';
import { toast } from 'sonner';
export const PricesPage = () => {
    const [prices, setPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [predictForm, setPredictForm] = useState({
        crop: 'Wheat',
        state: 'Punjab',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        rainfall_mm: 100,
        temperature_c: 30,
        demand_index: 1.0,
        inflation_rate: 5.5
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
                        unit: record.unit || 'kg',
                        trend,
                        change: Number(change.toFixed(2)),
                        historicalPrices: history,
                    };
                });
                setPrices(mapped);
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load prices');
            }
            finally {
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
        if (series.length === 0)
            return [];
        const labels = new Set();
        series.forEach((item) => {
            (item.historicalPrices || []).forEach((point) => {
                labels.add(new Date(point.date).toLocaleDateString('en-IN', { month: 'short' }));
            });
        });
        const sortedLabels = Array.from(labels);
        return sortedLabels.map((label) => {
            const entry = { month: label };
            series.forEach((item) => {
                const point = (item.historicalPrices || []).find((p) => new Date(p.date).toLocaleDateString('en-IN', { month: 'short' }) === label);
                entry[item.product] = point?.price || null;
            });
            return entry;
        });
    }, [prices]);
    if (isLoading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading...</div>
      </div>);
    }
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Prices</h1>
        <p className="text-muted-foreground">Real-time market prices and AI-powered predictions</p>
      </div>

      {/* Price Predictor Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            AI Price Predictor
          </CardTitle>
          <CardDescription>
            Predict future crop prices using ML model with 99% accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Crop</Label>
              <Select value={predictForm.crop} onValueChange={(value) => setPredictForm({...predictForm, crop: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crops.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>State</Label>
              <Select value={predictForm.state} onValueChange={(value) => setPredictForm({...predictForm, state: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rainfall (mm)</Label>
              <Input type="number" value={predictForm.rainfall_mm} onChange={(e) => setPredictForm({...predictForm, rainfall_mm: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Temperature (°C)</Label>
              <Input type="number" value={predictForm.temperature_c} onChange={(e) => setPredictForm({...predictForm, temperature_c: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Month</Label>
              <Input type="number" min="1" max="12" value={predictForm.month} onChange={(e) => setPredictForm({...predictForm, month: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" value={predictForm.year} onChange={(e) => setPredictForm({...predictForm, year: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Demand Index</Label>
              <Input type="number" step="0.1" value={predictForm.demand_index} onChange={(e) => setPredictForm({...predictForm, demand_index: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Inflation Rate (%)</Label>
              <Input type="number" step="0.1" value={predictForm.inflation_rate} onChange={(e) => setPredictForm({...predictForm, inflation_rate: parseFloat(e.target.value)})} />
            </div>
          </div>
          <Button onClick={handlePredictPrice} disabled={isPredicting} className="w-full md:w-auto">
            {isPredicting ? 'Predicting...' : 'Predict Price'}
          </Button>

          {prediction && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Price</p>
                  <p className="text-3xl font-bold text-green-600">₹{prediction.predicted_price}</p>
                  <p className="text-sm text-muted-foreground">{prediction.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className={`text-xl font-semibold ${prediction.trend === 'increase' ? 'text-green-600' : prediction.trend === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                    {prediction.trend.toUpperCase()}
                  </p>
                  <p className="text-sm mt-2">{prediction.insights}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <p className="text-sm"><strong>Season:</strong> {prediction.season}</p>
                <p className="text-sm"><strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(0)}%</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.map((price, index) => (<motion.div key={price.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600 dark:text-green-400"/>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${price.trend === 'up' ? 'text-green-600' : price.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {price.trend === 'up' ? (<TrendingUp className="w-4 h-4"/>) : price.trend === 'down' ? (<TrendingDown className="w-4 h-4"/>) : (<TrendingUp className="w-4 h-4"/>)}
                    {Math.abs(price.change)}%
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{price.product}</h3>
                <p className="text-sm text-muted-foreground mb-3">per {price.unit}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">₹{price.currentPrice}</span>
                  <span className="text-sm text-muted-foreground">/{price.unit}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>Historical price trends from recent data points</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (<p className="text-sm text-muted-foreground">No historical price data available.</p>) : (<ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis />
                <Tooltip />
                <Legend />
                {prices.slice(0, 3).map((item, idx) => (<Line key={item.id} type="monotone" dataKey={item.product} stroke={idx === 0 ? '#16a34a' : idx === 1 ? '#84cc16' : '#f59e0b'} strokeWidth={2} connectNulls/>))}
              </LineChart>
            </ResponsiveContainer>)}
        </CardContent>
      </Card>
    </div>);
};
