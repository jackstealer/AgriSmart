import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  CloudSun,
  LocateFixed,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';

import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { weatherService } from '../services/api';


export const WeatherPage = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);

  // 🌍 Get weather from city
  const handleGetCoordinates = async () => {
    if (!city) {
      toast.error('Enter city name');
      return;
    }

    try {
      setIsLoading(true);

      // 1️⃣ Get coordinates using OpenStreetMap (Nominatim)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          city
        )}&format=json`
      );

      const geoData = await geoRes.json();

      if (!geoData.length) {
        toast.error('City not found');
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);

      // 2️⃣ Get weather from backend with AI suggestions
      const backendRes = await weatherService.getCurrentWeather(lat, lon);
      const weatherData = backendRes.data.data;

      // 3️⃣ Format data
      const formatted = {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        rainfall: weatherData.rainfall,
        forecastSummary: weatherData.forecastSummary,
        city: city,
        createdAt: weatherData.createdAt
      };

      setWeather(formatted);
      setAiSuggestion(weatherData.aiSuggestion);
      setRiskLevel(weatherData.riskLevel);

      // 💾 Optional caching
      localStorage.setItem(city.toLowerCase(), JSON.stringify(formatted));

    } catch (error) {
      toast.error('Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  };

  // 🌤️ Icon mapper
  const getWeatherIcon = (condition) => {
    const normalized = String(condition || '').toLowerCase();

    const iconMap = {
      sunny: Sun,
      clear: Sun,
      'partly cloudy': CloudSun,
      cloudy: Cloud,
      clouds: Cloud,
      rain: CloudRain,
      drizzle: CloudRain
    };

    const Icon = iconMap[normalized] || Cloud;
    return <Icon className="w-16 h-16" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Weather</h1>
        <p className="text-muted-foreground">
          Get current weather insights for your fields
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Current Weather</CardTitle>
          <CardDescription>
            Enter your city to pull live weather data
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              placeholder="City Name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleGetCoordinates()
              }
            />

            <Button
              onClick={handleGetCoordinates}
              className="gap-2"
              disabled={isLoading}
            >
              <LocateFixed className="w-4 h-4" />
              {isLoading ? 'Fetching...' : 'Fetch'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weather Display */}
      {weather ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-white">
                Current Weather — {weather.city}
              </CardTitle>

              <CardDescription className="text-blue-100">
                {new Date(weather.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-6xl font-bold mb-2">
                    {weather.temperature !== undefined
                      ? `${weather.temperature}°C`
                      : 'N/A'}
                  </div>

                  <p className="text-2xl text-blue-100">
                    {weather.forecastSummary}
                  </p>
                </div>

                <div className="text-blue-100">
                  {getWeatherIcon(weather.forecastSummary)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-blue-400">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-blue-100">Humidity</p>
                    <p>{weather.humidity}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-blue-100">Wind Speed</p>
                    <p>{weather.windSpeed} km/h</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-blue-100">Rainfall</p>
                    <p>{weather.rainfall} mm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No weather data available yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions Card */}
      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {riskLevel === 'high' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {riskLevel === 'medium' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {riskLevel === 'low' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  AI Farming Suggestions
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                  riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {riskLevel?.toUpperCase()} RISK
                </span>
              </div>
              <CardDescription>
                AI-powered recommendations based on current weather conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {aiSuggestion}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
