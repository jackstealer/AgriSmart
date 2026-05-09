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

// GET /api/prices
export const getLatestPrices = async (req, res) => {
  try {
    const defaultCrops = [
      { crop: 'Wheat',  state: 'Punjab'           },
      { crop: 'Rice',   state: 'West Bengal'       },
      { crop: 'Maize',  state: 'Karnataka'         },
      { crop: 'Potato', state: 'Uttar Pradesh'     },
      { crop: 'Onion',  state: 'Maharashtra'       },
      { crop: 'Tomato', state: 'Andhra Pradesh'    },
    ];

    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    const results = await Promise.allSettled(
      defaultCrops.map(({ crop, state }) =>
        axios.post(`${ML_SERVER}/predict-price`, {
          crop, state, month, year,
          rainfall_mm: 100, temperature_c: 30,
          demand_index: 1.0, inflation_rate: 5.5,
        })
      )
    );

    const data = results.map((result, i) => {
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
      return {
        _id:             defaultCrops[i].crop,
        cropName:        defaultCrops[i].crop,
        predictedPrice:  0,
        unit:            'quintal',
        trend:           'stable',
        insights:        'ML server unavailable — run: python ml-server/app.py',
        historicalPrices: [],
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

    const mlRes = await axios.post(`${ML_SERVER}/predict-price`, {
      crop, state,
      month:          month          || new Date().getMonth() + 1,
      year:           year           || new Date().getFullYear(),
      rainfall_mm:    rainfall_mm    ?? 100,
      temperature_c:  temperature_c  ?? 30,
      demand_index:   demand_index   ?? 1.0,
      inflation_rate: inflation_rate ?? 5.5,
    });

    if (!mlRes.data.success) {
      return res.status(500).json({ success: false, message: mlRes.data.error });
    }

    res.json({ success: true, data: mlRes.data.data });

  } catch (error) {
    console.error('predictPrice error:', error?.message);
    res.status(500).json({ success: false, message: 'Prediction failed' });
  }
};