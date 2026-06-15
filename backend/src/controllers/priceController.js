import axios from 'axios';

const ML_SERVER = process.env.ML_SERVER_URL || 'http://localhost:5001';

// Helper — generate 6 months of historical points around predicted price
const generateHistorical = (currentPrice) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const variance = (Math.random() - 0.5) * 0.12;
    months.push({
      date:  d.toISOString(),
      price: Math.round(currentPrice * (1 + variance)),
    });
  }
  return months;
};

// Algorithmic fallback — same formula as priceStreamService
const algorithmicPrice = (cropName, basePrice) => {
  const month = new Date().getMonth() + 1;
  const seasonalFactors = {
    1: 1.02, 2: 1.05, 3: 1.08, 4: 1.05, 5: 0.95, 6: 0.88,
    7: 0.85, 8: 0.90, 9: 0.95, 10: 0.98, 11: 1.00, 12: 1.03,
  };
  const seasonalFactor = seasonalFactors[month] || 1.0;
  const inflationFactor = 1 + (new Date().getFullYear() - 2020) * 0.055;
  const noise = 1 + (Math.random() - 0.5) * 0.06;
  const predictedPrice = Math.round(basePrice * seasonalFactor * inflationFactor * noise);
  const trend =
    predictedPrice > basePrice * 1.02 ? 'increase' :
    predictedPrice < basePrice * 0.98 ? 'decrease' : 'stable';
  return { predictedPrice, trend };
};

// GET /api/prices
export const getLatestPrices = async (req, res) => {
  try {
    const defaultCrops = [
      { crop: 'Wheat',  state: 'Punjab',        basePrice: 2275 },
      { crop: 'Rice',   state: 'West Bengal',   basePrice: 2183 },
      { crop: 'Maize',  state: 'Karnataka',     basePrice: 2225 },
      { crop: 'Potato', state: 'Uttar Pradesh', basePrice: 800  },
      { crop: 'Onion',  state: 'Maharashtra',   basePrice: 1500 },
      { crop: 'Tomato', state: 'Andhra Pradesh',basePrice: 1200 },
    ];

    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    const results = await Promise.allSettled(
      defaultCrops.map(({ crop, state }) =>
        axios.post(`${ML_SERVER}/predict-price`, {
          crop, state, month, year,
          rainfall_mm: 100, temperature_c: 30,
          demand_index: 1.0, inflation_rate: 5.5,
        }, { timeout: 4000 })
      )
    );

    const data = results.map((result, i) => {
      const cropInfo = defaultCrops[i];

      if (result.status === 'fulfilled' && result.value.data.success) {
        const d = result.value.data.data;
        return {
          _id:             `${d.crop}-${d.state}`,
          cropName:        d.crop,
          predictedPrice:  d.predicted_price,
          unit:            'quintal',
          trend:           d.trend,
          insights:        d.insights,
          season:          d.season,
          confidence:      d.confidence,
          factors:         d.factors,
          historicalPrices: generateHistorical(d.predicted_price),
        };
      }

      // Algorithmic fallback — never return 0
      const { predictedPrice, trend } = algorithmicPrice(cropInfo.crop, cropInfo.basePrice);
      return {
        _id:             cropInfo.crop,
        cropName:        cropInfo.crop,
        predictedPrice,
        unit:            'quintal',
        trend,
        insights:        `${cropInfo.crop} price estimated from seasonal & inflation model.`,
        historicalPrices: generateHistorical(predictedPrice),
      };
    });

    res.json({ success: true, data });

  } catch (error) {
    console.error('getLatestPrices error:', error?.message);
    res.status(500).json({ success: false, message: 'Failed to fetch prices' });
  }
};

// POST /api/prices/predict
export const predictPrice = async (req, res) => {
  try {
    const {
      crop, state, month, year,
      rainfall_mm, temperature_c,
      demand_index, inflation_rate
    } = req.body;

    if (!crop || !state) {
      return res.status(400).json({ success: false, message: 'crop and state are required' });
    }

    try {
      const mlRes = await axios.post(`${ML_SERVER}/predict-price`, {
        crop, state,
        month:          month          || new Date().getMonth() + 1,
        year:           year           || new Date().getFullYear(),
        rainfall_mm:    rainfall_mm    ?? 100,
        temperature_c:  temperature_c  ?? 30,
        demand_index:   demand_index   ?? 1.0,
        inflation_rate: inflation_rate ?? 5.5,
      }, { timeout: 5000 });

      if (mlRes.data.success) {
        return res.json({ success: true, data: mlRes.data.data });
      }
    } catch (_mlErr) {
      // ML server offline — use algorithmic fallback
    }

    // Fallback algorithmic prediction
    const basePrices = {
      Wheat: 2275, Rice: 2183, Maize: 2225, Potato: 800,
      Onion: 1500, Tomato: 1200, Soybean: 4600, Cotton: 6620,
      Chilli: 8000, Gram: 5000, Mustard: 5500, Sugarcane: 350,
    };
    const base = basePrices[crop] || 2000;
    const { predictedPrice, trend } = algorithmicPrice(crop, base);

    res.json({
      success: true,
      data: {
        crop, state,
        predicted_price: predictedPrice,
        unit: 'quintal',
        trend,
        season: ['Dec','Jan','Feb'].includes(new Date().toLocaleString('en',{month:'short'})) ? 'winter' : 'other',
        confidence: 0.65,
        insights: `${crop} price estimated using seasonal and inflation model (ML server offline).`,
        factors: { seasonal: true, inflation: true },
      },
    });

  } catch (error) {
    console.error('predictPrice error:', error?.message);
    res.status(500).json({ success: false, message: 'Prediction failed' });
  }
};