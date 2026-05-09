import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import apiClient from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { RAZORPAY_KEY_ID } from '../services/envService.js';

export const OrdersPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await orderService.getAllOrders();
            const rawOrders = response.data?.data || [];
            const byId = new Map();
            rawOrders.forEach((order) => {
                if (!byId.has(order._id)) {
                    const shipment = order.shipmentId;
                    byId.set(order._id, {
                        id: order._id,
                        _id: order._id,
                        cropName: order.cropId?.cropName || 'Unknown Crop',
                        quantity: order.quantity,
                        totalAmount: order.totalAmount || 0,
                        status: order.status || 'pending',
                        createdAt: order.createdAt || new Date().toISOString(),
                        buyerId: order.buyerId,
                        transportFee: order.transportFee || order.delivery_charge || 0,
                        transportationMode: order.transportationMode || order.transport_type || 'self',
                        shipmentId: shipment?._id || shipment?.shipmentId || shipment || null,
                        shipment,
                        shippingAddress: order.shippingAddress || shipment?.destination?.address || shipment?.currentLocation || '',
                        razorpayOrderId: order.razorpayOrderId,
                        paymentId: order.paymentId,
                    });
                }
            });
            setOrders(Array.from(byId.values()));
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const createPaymentOrder = (orderId) => apiClient.post('/api/payments/create-order', { orderId });
    const verifyPayment = (data) => apiClient.post('/api/payments/verify', data);
    const requestRefund = (orderId) => apiClient.post('/api/payments/refund', { orderId });

    const handlePayment = async (order) => {
        try {
            const { data } = await createPaymentOrder(order._id);
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'AgriSmart',
                description: 'Crop Order Payment',
                order_id: data.razorpayOrderId,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: '#16a34a' },
                handler: async (response) => {
                    await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: order._id,
                    });
                    toast.success('Payment successful!');
                    setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: 'paid' } : o));
                   await fetchOrders()

                },
            };
            if (!window.Razorpay) {
                toast.error('Payment SDK not ready. Please retry in a moment.');
                return;
            }
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => toast.error('Payment failed. Try again.'));
            rzp.open();
        } catch (err) {
            toast.error('Could not initiate payment.');
        }
    };

    const handleRefund = async (orderId) => {
        try {
            await requestRefund(orderId);
            toast.success('Refund initiated successfully.');
            fetchOrders();
        } catch (err) {
            toast.error('Refund failed. Try again.');
        }
    };

    useEffect(() => {
        if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
        }
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'refunded':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const filterByStatus = (status) => {
        if (!status) return orders;
        return orders.filter((order) => order.status === status);
    };

    const OrderCard = ({ order, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{order.cropName}</CardTitle>
                            <CardDescription>Order #{order.id}</CardDescription>
                        </div>
                        
                        <Badge className={getStatusColor(order.status)}>
                            {t(`orders.status.${order.status}`)}
                            
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">{t('crops.quantity')}</p>
                                <p className="font-medium">{order.quantity}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">{t('orders.total')}</p>
                                <p className="font-medium">INR {order.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">{t('orders.orderDate')}</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">
                            {user?.role === 'farmer' ? t('orders.buyer') : t('orders.seller')}
                        </p>
                        <p className="font-medium">
                            {user?.role === 'farmer' ? order.buyerId || t('orders.buyer') : t('nav.profile')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => {
                            setSelectedOrder(order);
                            setDetailOpen(true);
                        }}>
                            {t('orders.viewDetails')}
                        </Button>
                        {user?.role !== 'farmer' && order.status === 'pending' && (
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handlePayment(order)}
                            >
                                {t('orders.payNow')}
                            </Button>
                        )}
                        {user?.role !== 'farmer' && order.status === 'paid' && (
                            <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleRefund(order._id)}
                            >
                                {t('orders.refund')}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
                <p className="text-muted-foreground">{t('orders.subtitle')}</p>
            </div>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                {selectedOrder ? (
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">{selectedOrder.cropName}</p>
                      <p>Order ID: {selectedOrder.id}</p>
                      <p>Quantity: {selectedOrder.quantity}</p>
                      <p>Price per unit: ₹{selectedOrder.totalAmount / selectedOrder.quantity}</p>
                      <p>Total: ₹{selectedOrder.totalAmount}</p>
                      <p>Transport: {selectedOrder.transportationMode === 'platform' ? 'AgriSmart Logistics' : 'Self'} (₹{selectedOrder.transportFee || 0})</p>
                      <p>Payment Status: <span className={`inline-flex px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                    </div>
                    <div className="space-y-2">
                      <p>Order Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      {selectedOrder.razorpayOrderId && <p>Transaction ID: {selectedOrder.razorpayOrderId}</p>}
                      {selectedOrder.shipmentId && <p>Shipment ID: {selectedOrder.shipmentId}</p>}
                      <p>Shipping Address: {selectedOrder.shippingAddress || 'Not provided'}</p>
                    </div>
                  </div>
                ) : <p className="text-muted-foreground">Select an order to view details</p>}
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">{t('orders.all')}</TabsTrigger>
                    <TabsTrigger value="pending">{t('orders.status.pending')}</TabsTrigger>
                    <TabsTrigger value="paid">{t('orders.status.paid')}</TabsTrigger>
                    <TabsTrigger value="failed">{t('orders.status.failed')}</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {orders.map((order, index) => (
                            <OrderCard key={order.id} order={order} index={index} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {filterByStatus('pending').map((order, index) => (
                            <OrderCard key={order.id} order={order} index={index} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="paid" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {filterByStatus('paid').map((order, index) => (
                            <OrderCard key={order.id} order={order} index={index} />
                        ))}
                    </div>
                </TabsContent>

                    <TabsContent value="failed" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {filterByStatus('failed').map((order, index) => (
                            <OrderCard key={order.id} order={order} index={index} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
