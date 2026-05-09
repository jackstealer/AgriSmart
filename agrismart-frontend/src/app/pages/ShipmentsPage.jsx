import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, CheckCircle, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { shipmentService } from '../services/api';
import { toast } from 'sonner';
export const ShipmentsPage = () => {
    const [trackingId, setTrackingId] = useState('');
    const [shipments, setShipments] = useState([]);
    const [trackedShipment, setTrackedShipment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const response = await shipmentService.getAllShipments();
                const mapped = (response.data?.data || []).map((shipment) => {
                    const coordinates = shipment.currentLocation?.coordinates;
                    const locationText = Array.isArray(coordinates)
                        ? `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
                        : typeof shipment.currentLocation === 'string'
                            ? shipment.currentLocation
                            : shipment.currentLocation?.address
                                || shipment.destination?.address
                                || 'Unknown';
                    return {
                        id: shipment._id,
                        orderId: shipment.orderId,
                        status: shipment.status || 'created',
                        currentLocation: locationText,
                        eta: shipment.eta || shipment.estimatedDelivery,
                        locationHistory: shipment.locationHistory,
                    };
                });
                setShipments(mapped);
            }
            catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load shipments');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchShipments();
    }, []);
    const handleTrack = async () => {
        if (!trackingId.trim()) {
            toast.error('Enter a shipment ID to track');
            return;
        }
        try {
            const response = await shipmentService.getShipmentById(trackingId.trim());
            const shipment = response.data?.data;
            const coordinates = shipment?.currentLocation?.coordinates;
            const locationText = Array.isArray(coordinates)
                ? `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
                : typeof shipment?.currentLocation === 'string'
                    ? shipment.currentLocation
                    : shipment?.currentLocation?.address
                        || shipment?.destination?.address
                        || 'Unknown';
            setTrackedShipment({
                id: shipment._id,
                orderId: shipment.orderId,
                status: shipment.status || 'created',
                currentLocation: locationText,
                eta: shipment.eta || shipment.estimatedDelivery,
                locationHistory: shipment.locationHistory,
            });
        }
        catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to track shipment');
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading...</div>
      </div>);
    }
    const renderTimeline = (shipment) => {
        const history = shipment.locationHistory || [];
        if (history.length === 0) {
            return <p className="text-sm text-muted-foreground">No tracking updates yet.</p>;
        }
        return (<div className="space-y-4">
        {history.map((update, idx) => (<div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === history.length - 1 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <CheckCircle className="w-4 h-4 text-white"/>
              </div>
              {idx < history.length - 1 && (<div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600"/>)}
            </div>
            <div className="flex-1 pb-8">
              <p className="font-medium">Location Update</p>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(update.coordinates)
                    ? `${update.coordinates[1].toFixed(4)}, ${update.coordinates[0].toFixed(4)}`
                    : update.location || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {update.timestamp || update.timestamps
                    ? new Date(update.timestamp || update.timestamps).toLocaleString()
                    : 'N/A'}
              </p>
            </div>
          </div>))}
      </div>);
    };
    const renderShipmentCard = (shipment, index) => (<motion.div key={shipment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Shipment ID: {shipment.id}</CardTitle>
              <CardDescription>Order #{shipment.orderId || 'N/A'}</CardDescription>
            </div>
            <Badge>
              <Truck className="w-3 h-3 mr-1"/>
              {shipment.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600"/>
            <div>
              <p className="font-medium">Current Location</p>
              <p className="text-sm text-muted-foreground">{shipment.currentLocation}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600"/>
            <div>
              <p className="font-medium">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">
                {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Shipment Timeline</h4>
            {renderTimeline(shipment)}
          </div>
        </CardContent>
      </Card>
    </motion.div>);
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shipment Tracking</h1>
        <p className="text-muted-foreground">Track your orders in real-time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track a Shipment</CardTitle>
          <CardDescription>Enter your shipment ID to get updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter Shipment ID" value={trackingId} onChange={(e) => setTrackingId(e.target.value)}/>
            <Button onClick={handleTrack}>Track</Button>
          </div>
        </CardContent>
      </Card>

      {trackedShipment && (<div className="space-y-4">
          <h2 className="text-xl font-semibold">Tracked Shipment</h2>
          {renderShipmentCard(trackedShipment, 0)}
        </div>)}

      <div className="space-y-4">
        {shipments.map((shipment, index) => renderShipmentCard(shipment, index))}
      </div>
    </div>);
};
