import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { cropService } from '../services/api';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
export const CropsPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const geoCacheRef = useRef(new Map());
    const [crops, setCrops] = useState([]);
    const [filteredCrops, setFilteredCrops] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [transportMode, setTransportMode] = useState('self');
    const [transportFee, setTransportFee] = useState(500);
    const [shippingAddress, setShippingAddress] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [cityResults, setCityResults] = useState([]);
    const [citySearchLoading, setCitySearchLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        quality: 'Standard',
        harvestDate: '',
        locationName: '',
        locationLat: '',
        locationLng: '',
    });
    useEffect(() => {
        const reverseGeocode = async (lat, lng) => {
            const key = `${lat},${lng}`;
            const cache = geoCacheRef.current;
            if (cache.has(key))
                return cache.get(key);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                const data = await res.json();
                const name = [
                    data.address?.village || data.address?.town || data.address?.city,
                    data.address?.state_district || data.address?.county,
                    data.address?.state,
                ].filter(Boolean).join(', ') || data.display_name;
                const value = name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                cache.set(key, value);
                return value;
            }
            catch {
                const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                cache.set(key, fallback);
                return fallback;
            }
        };
        const fetchCrops = async () => {
            try {
                const response = await cropService.getAllCrops();
                const mapped = (response.data?.data || []).map((crop) => {
                    const coordinates = crop?.location?.coordinates;
                    const lng = Array.isArray(coordinates) ? coordinates[0] : undefined;
                    const lat = Array.isArray(coordinates) ? coordinates[1] : undefined;
                    return {
                        id: crop._id,
                        _id: crop._id,
                        name: crop.cropName,
                        variety: crop.variety || 'Unknown',
                        quantity: crop.quantity,
                        unit: crop.unit || 'kg',
                        pricePerUnit: crop.pricePerUnit || 0,
                        quality: crop.quality,
                        harvestDate: crop.harvestDate,
                        status: crop.status || 'available',
                        image: crop.images?.[0],
                        location: typeof lat === 'number' && typeof lng === 'number'
                            ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                            : 'Unknown',
                        locationLat: typeof lat === 'number' ? lat : undefined,
                        locationLng: typeof lng === 'number' ? lng : undefined,
                    };
                });
                const withAddresses = await Promise.all(mapped.map(async (crop) => {
                    if (typeof crop.locationLat === 'number' && typeof crop.locationLng === 'number') {
                        const pretty = await reverseGeocode(crop.locationLat, crop.locationLng);
                        return { ...crop, location: pretty };
                    }
                    return crop;
                }));
                setCrops(withAddresses);
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load crops');
            }
        };
        fetchCrops();
    }, []);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    useEffect(() => {
        let filtered = crops;
        if (searchQuery) {
            filtered = filtered.filter((crop) => crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                crop.variety.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((crop) => crop.status === statusFilter);
        }
        setFilteredCrops(filtered);
    }, [searchQuery, statusFilter, crops]);
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setLocationLoading(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await res.json();
                const name = [
                    data.address?.village || data.address?.town || data.address?.city,
                    data.address?.state_district || data.address?.county,
                    data.address?.state,
                ].filter(Boolean).join(', ');
                setFormData((prev) => ({
                    ...prev,
                    locationLat: latitude.toFixed(4),
                    locationLng: longitude.toFixed(4),
                    locationName: name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                }));
            }
            catch {
                setFormData((prev) => ({
                    ...prev,
                    locationLat: latitude.toFixed(4),
                    locationLng: longitude.toFixed(4),
                    locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                }));
            }
            setLocationLoading(false);
        }, (err) => {
            setLocationLoading(false);
            if (err.code === 1)
                setLocationError('Location access denied. Please allow location or enter city name.');
            else
                setLocationError('Could not detect location. Please enter city name below.');
        }, { timeout: 10000 });
    };
    const handleCitySearch = async () => {
        if (!cityInput.trim())
            return;
        setCitySearchLoading(true);
        setCityResults([]);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&countrycodes=in&limit=4&format=json`);
            const data = await res.json();
            setCityResults(data);
            if (data.length === 0)
                setLocationError('No results found. Try a different city name.');
            else
                setLocationError('');
        }
        catch {
            setLocationError('Search failed. Please try again.');
        }
        setCitySearchLoading(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            cropName: formData.name,
            variety: formData.variety,
            quantity: Number(formData.quantity),
            unit: formData.unit,
            pricePerUnit: Number(formData.pricePerUnit),
            quality: formData.quality,
            harvestDate: formData.harvestDate ? new Date(formData.harvestDate).toISOString() : undefined,
        };
        const lat = Number(formData.locationLat);
        const lng = Number(formData.locationLng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            payload.location = { lat, lng };
        }
        if (editingCrop) {
            try {
                const response = await cropService.updateCrop(editingCrop.id, payload);
                const updated = response.data?.data;
                setCrops((prev) => prev.map((crop) => crop.id === editingCrop.id
                    ? {
                        ...crop,
                        name: updated.cropName,
                        variety: updated.variety || crop.variety,
                        quantity: updated.quantity,
                        unit: updated.unit || crop.unit,
                        pricePerUnit: updated.pricePerUnit || crop.pricePerUnit,
                        quality: updated.quality || crop.quality,
                        harvestDate: updated.harvestDate || crop.harvestDate,
                        status: updated.status || crop.status,
                    }
                    : crop));
                toast.success('Crop updated successfully!');
                setEditingCrop(null);
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to update crop');
            }
        }
        else {
            try {
                const response = await cropService.createCrop(payload);
                const created = response.data?.data;
                const coordinates = created?.location?.coordinates;
                const createdCrop = {
                    id: created._id,
                    _id: created._id,
                    name: created.cropName,
                    variety: created.variety || 'Unknown',
                    quantity: created.quantity,
                    unit: created.unit || 'kg',
                    pricePerUnit: created.pricePerUnit || 0,
                    quality: created.quality,
                    harvestDate: created.harvestDate,
                    status: created.status || 'available',
                    image: created.images?.[0],
                    location: Array.isArray(coordinates) && coordinates.length === 2
                        ? `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
                        : 'Unknown',
                    locationLat: Array.isArray(coordinates) ? coordinates[1] : undefined,
                    locationLng: Array.isArray(coordinates) ? coordinates[0] : undefined,
                };
                setCrops([createdCrop, ...crops]);
                toast.success('Crop added successfully!');
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to add crop');
            }
        }
        setFormData({
            name: '',
            variety: '',
            quantity: '',
            unit: 'kg',
            pricePerUnit: '',
            quality: 'Standard',
            harvestDate: '',
            locationName: '',
            locationLat: '',
            locationLng: '',
        });
        setCityInput('');
        setCityResults([]);
        setLocationError('');
        setLocationLoading(false);
        setCitySearchLoading(false);
        setIsAddDialogOpen(false);
    };
    const handleEdit = (crop) => {
        setEditingCrop(crop);
        setFormData({
            name: crop.name,
            variety: crop.variety,
            quantity: crop.quantity.toString(),
            unit: crop.unit,
            pricePerUnit: crop.pricePerUnit.toString(),
            quality: crop.quality || 'Standard',
            harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().slice(0, 10) : '',
            locationName: crop.location && crop.location !== 'Unknown'
                ? crop.location
                : (Number.isFinite(crop.locationLat) && Number.isFinite(crop.locationLng)
                    ? `${Number(crop.locationLat).toFixed(4)}, ${Number(crop.locationLng).toFixed(4)}`
                    : ''),
            locationLat: crop.locationLat?.toString() || '',
            locationLng: crop.locationLng?.toString() || '',
        });
        setIsAddDialogOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await cropService.deleteCrop(id);
            setCrops(crops.filter((crop) => crop.id !== id));
            toast.success('Crop deleted successfully!');
        }
        catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete crop');
        }
    };
    const resetForm = () => {
        setEditingCrop(null);
        setFormData({
            name: '',
            variety: '',
            quantity: '',
            unit: 'kg',
            pricePerUnit: '',
            quality: 'Standard',
            harvestDate: '',
            locationName: '',
            locationLat: '',
            locationLng: '',
        });
        setCityInput('');
        setCityResults([]);
        setLocationError('');
        setLocationLoading(false);
        setCitySearchLoading(false);
    };
    const handlePlaceOrder = async () => {
        if (!selectedCrop)
            return;
        try {
            setOrderLoading(true);
            // Create order on backend
            const orderRes = await api.post('/api/orders', {
                cropId: selectedCrop._id,
                quantity: orderQuantity,
                pricePerUnit: selectedCrop.pricePerUnit,
                totalAmount: orderQuantity * selectedCrop.pricePerUnit + (transportMode === 'platform' ? transportFee : 0),
                transportationMode: transportMode,
                transportFee: transportMode === 'platform' ? transportFee : 0,
                transport_type: transportMode,
                delivery_charge: transportMode === 'platform' ? transportFee : 0,
                shippingAddress,
            });
            const createdOrder = orderRes.data?.data?.order || orderRes.data?.data || orderRes.data;

            const { data: paymentData } = await api.post('/api/payments/create-order', {
                orderId: createdOrder?._id,
            });
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: 'AgriSmart 🌱',
                description: `Order for ${selectedCrop.name}`,
                order_id: paymentData.razorpayOrderId,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: '#16a34a' },
                handler: async (response) => {
                    await api.post('/api/payments/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: createdOrder?._id,
                    });
                    toast.success('Order placed & payment successful! 🎉');
                    setSelectedCrop(null);
                },
            };
            if (!window.Razorpay) {
                toast.error('Payment SDK not ready. Please try again.');
                return;
            }
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
            });
            rzp.open();
        }
        catch (err) {
            toast.error('Something went wrong. Please try again.');
        }
        finally {
            setOrderLoading(false);
        }
    };
    return (<div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{t('crops.title')}</h1>
          <p className="text-white/50 mt-1">{t('crops.subtitle')}</p>
        </div>
        {user?.role === 'farmer' && (<Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open)
                    resetForm();
            }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 rounded-xl shadow-lg shadow-green-900/40">
                <Plus className="w-4 h-4"/>
                {t('crops.addCrop')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>{editingCrop ? t('crops.editCrop') : t('crops.addNewCrop')}</DialogTitle>
                <DialogDescription>
                  {editingCrop ? t('crops.updateCrop') : t('crops.addNewCrop')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('crops.cropName')}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Wheat" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variety">{t('crops.variety')}</Label>
                    <Input id="variety" name="variety" value={formData.variety} onChange={handleInputChange} placeholder="e.g., Basmati" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t('crops.quantity')}</Label>
                    <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="e.g., 5000" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">{t('crops.unit')}</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="ton">Tons</SelectItem>
                        <SelectItem value="quintal">Quintals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">{t('crops.pricePerUnit')} {formData.unit}</Label>
                    <Input id="pricePerUnit" name="pricePerUnit" type="number" value={formData.pricePerUnit} onChange={handleInputChange} placeholder="e.g., 25" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quality">{t('crops.quality')}</Label>
                    <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organic">Organic</SelectItem>
                        <SelectItem value="Grade A">Grade A</SelectItem>
                        <SelectItem value="Grade B">Grade B</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">{t('crops.harvestDate')}</Label>
                    <Input id="harvestDate" name="harvestDate" type="date" value={formData.harvestDate} onChange={handleInputChange}/>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>{t('crops.location')}</Label>
                    {formData.locationName ? (<div className="flex items-center justify-between p-3 rounded-md border border-green-500/50 bg-green-50">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">📍</span>
                          <div>
                            <p className="font-semibold text-green-700">{formData.locationName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.locationLat && formData.locationLng
                                    ? `${formData.locationLat}, ${formData.locationLng}`
                                    : 'Coordinates saved'}
                            </p>
                          </div>
                        </div>
                        <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => {
                setFormData((prev) => ({
                    ...prev,
                    locationName: '',
                    locationLat: '',
                    locationLng: '',
                }));
                setCityInput('');
                setCityResults([]);
                setLocationError('');
            }}>
                          ×
                        </button>
                      </div>) : (<div className="space-y-3">
                        <Button type="button" onClick={handleGetLocation} disabled={locationLoading} className="w-full justify-center gap-2" style={{
                border: '1px dashed #16a34a',
                backgroundColor: '#f0fdf4',
                color: '#166534',
            }}>
                          {locationLoading ? (<>
                              <span className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent" style={{ animation: 'spin 1s linear infinite' }}/>
                              <span>Detecting location...</span>
                            </>) : (<>
                              <span>📍</span>
                              <span>Use My Current Location</span>
                            </>)}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">── or enter city ──</p>
                        <div className="flex gap-2">
                          <Input placeholder="e.g., Ludhiana, Punjab" value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCitySearch();
                }
            }}/>
                          <Button type="button" onClick={handleCitySearch} disabled={citySearchLoading}>
                            {citySearchLoading ? '...' : 'Search'}
                          </Button>
                        </div>
                        {cityResults.length > 0 && (<div className="border rounded-md divide-y">
                            {cityResults.map((result) => {
                const nameParts = (result.display_name || '').split(',').slice(0, 4).map((part) => part.trim()).filter(Boolean).join(', ');
                return (<button type="button" key={`${result.place_id}-${result.lat}-${result.lon}`} className="w-full text-left p-2 hover:bg-green-50 flex items-start gap-2" onClick={() => {
                    const lat = Number(result.lat);
                    const lng = Number(result.lon);
                    setFormData((prev) => ({
                        ...prev,
                        locationLat: Number.isFinite(lat) ? lat.toFixed(4) : '',
                        locationLng: Number.isFinite(lng) ? lng.toFixed(4) : '',
                        locationName: nameParts || result.display_name || 'Selected location',
                    }));
                    setCityResults([]);
                    setCityInput('');
                    setLocationError('');
                }}>
                    <span>📍</span>
                    <span className="text-sm">{nameParts || result.display_name}</span>
                  </button>);
            })}
                          </div>)}
                        {locationError && <p className="text-sm text-red-600">{locationError}</p>}
                      </div>)}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
            }}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">{editingCrop ? t('crops.updateCrop') : t('crops.addCrop')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>)}
      </div>

      <div className="glass-dark rounded-2xl p-4 border border-white/8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-white/40"/>
              <Input placeholder={t('crops.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"/>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2 text-white/40"/>
                <SelectValue placeholder={t('crops.allStatus')}/>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                <SelectItem value="all" className="text-white hover:bg-white/10">{t('crops.allStatus')}</SelectItem>
                <SelectItem value="available" className="text-white hover:bg-white/10">{t('crops.available')}</SelectItem>
                <SelectItem value="sold" className="text-white hover:bg-white/10">{t('crops.sold')}</SelectItem>
                <SelectItem value="expired" className="text-white hover:bg-white/10">{t('crops.expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      {filteredCrops.length === 0 ? (<div className="glass-dark rounded-2xl py-16 text-center border border-white/8">
            <p className="text-white/40">{t('crops.noCrops')}</p>
        </div>) : (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop, index) => (<motion.div key={crop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <div className="glass-dark rounded-2xl overflow-hidden border border-white/8 hover:border-green-500/30 transition-all duration-300 group">
                <img src={crop.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400'} alt={crop.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{crop.name}</h3>
                      <p className="text-sm text-white/40">{crop.variety}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      crop.status === 'available' ? 'bg-green-500/20 text-green-400'
                      : crop.status === 'sold' ? 'bg-white/10 text-white/50'
                      : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t(`crops.${crop.status}`)}
                    </span>
                  </div>
                </div>
                <div className="p-4 pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-white/40 text-xs">{t('crops.quantity')}</p>
                      <p className="font-semibold text-white">{crop.quantity} {crop.unit}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">{t('crops.price')}</p>
                      <p className="font-semibold text-green-400">₹{crop.pricePerUnit}/{crop.unit}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/40 text-xs">{t('crops.location')}</p>
                      <p className="font-medium text-white text-sm">{crop.location}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">{t('crops.harvest')}</p>
                      <p className="font-medium text-white text-sm">
                        {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {user?.role === 'farmer' && (<div className="flex gap-2 pt-3 border-t border-white/8">
                      <Button variant="outline" size="sm" className="flex-1 gap-2 border-white/15 text-white hover:bg-white/10" onClick={() => handleEdit(crop)}>
                        <Edit className="w-4 h-4"/>
                        {t('common.edit')}
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1 gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20" onClick={() => handleDelete(crop.id)}>
                        <Trash2 className="w-4 h-4"/>
                        {t('common.delete')}
                      </Button>
                    </div>)}

                  {user?.role === 'buyer' && (<Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 rounded-xl" onClick={() => {
                setSelectedCrop(crop);
                setOrderQuantity(1);
                setShippingAddress('');
            }}>
                      {t('crops.placeOrder')}
                    </Button>)}
                </div>
              </div>
            </motion.div>))}
        </div>)}
      {selectedCrop && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-white">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{selectedCrop.name}</h3>
              <p className="text-white/50">₹{selectedCrop.pricePerUnit} per {selectedCrop.unit}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderQuantity" className="text-white/60 text-xs">{t('crops.quantity')}</Label>
              <Input id="orderQuantity" type="number" min={1} max={selectedCrop.quantity} value={orderQuantity} onChange={(e) => {
                const value = Number(e.target.value);
                const safeValue = Math.max(1, Math.min(Number(selectedCrop.quantity) || 1, Number.isNaN(value) ? 1 : value));
                setOrderQuantity(safeValue);
            }} className="bg-white/5 border-white/10 text-white"/>
            </div>
            <div className="space-y-3 glass-green rounded-xl p-4 border border-green-500/20">
              <p className="font-bold text-white">Transportation</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-green-500/30 transition-colors">
                  <input type="radio" name="transport" value="self" checked={transportMode === 'self'} onChange={() => setTransportMode('self')}/>
                  <div>
                    <p className="font-medium text-white text-sm">I will arrange my own transport</p>
                    <p className="text-xs text-white/40">No extra charge</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-green-500/30 transition-colors">
                  <input type="radio" name="transport" value="platform" checked={transportMode === 'platform'} onChange={() => setTransportMode('platform')}/>
                  <div>
                    <p className="font-medium text-white text-sm">AgriSmart Logistics</p>
                    <p className="text-xs text-white/40">Delivery charge: ₹{transportFee}</p>
                  </div>
                </label>
              </div>
              <div className="text-sm space-y-1 pt-2 border-t border-white/10">
                <p className="text-white/50">Crop total: <span className="text-white">₹{orderQuantity * selectedCrop.pricePerUnit}</span></p>
                {transportMode === 'platform' && <p className="text-white/50">Transport fee: <span className="text-white">₹{transportFee}</span></p>}
                <p className="font-bold text-green-400 text-base">Grand total: ₹{orderQuantity * selectedCrop.pricePerUnit + (transportMode === 'platform' ? transportFee : 0)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingAddress" className="text-white/60 text-xs">Delivery Address</Label>
              <textarea
                id="shippingAddress"
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white p-3 text-sm placeholder:text-white/30 outline-none focus:border-green-500/50"
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="House, Street, City, Pincode"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setSelectedCrop(null); setShippingAddress(''); }} disabled={orderLoading} className="border-white/15 text-white hover:bg-white/10">
                {t('common.cancel')}
              </Button>
              <Button onClick={handlePlaceOrder} disabled={orderLoading || !shippingAddress.trim()} className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-0 rounded-xl">
                {orderLoading ? t('common.processing') : t('orders.confirmPay')}
              </Button>
            </div>
          </div>
        </div>)}
    </div>);
};
