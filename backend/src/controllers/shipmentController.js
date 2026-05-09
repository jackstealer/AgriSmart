import { Shipment } from "../models/Shipment.models.js";
import { Order } from "../models/Order.models.js";
import { pathwayService } from "../config/pathway.js";

export const createShipment = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ success: false, message: "Only farmers can create shipments" });
    }

    const { orderId, cropId, cropName, quantity, agreedPrice, buyerId, destination, truckId } = req.body;
    if (!buyerId || !quantity || !agreedPrice) {
      return res.status(400).json({ success: false, message: "buyerId, quantity and agreedPrice are required" });
    }

    let linkedOrder = null;
    if (orderId) {
      linkedOrder = await Order.findById(orderId);
      if (!linkedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    }

    const shipment = new Shipment({
      farmerId: req.user.id,
      buyerId,
      cropId,
      cropName,
      quantity,
      agreedPrice,
      truckId,
      orderId,
      destination: destination
        ? {
            address: destination.address,
            location: destination.coordinates
              ? {
                  type: "Point",
                  coordinates: [destination.coordinates.lng, destination.coordinates.lat],
                }
              : undefined,
          }
        : undefined,
    });

    await shipment.save();

    // AI/Pathway integration hook: safe no-op until provider is integrated.
    await pathwayService.startShipmentMonitoring(shipment._id, {
      farmerId: shipment.farmerId,
      buyerId: shipment.buyerId,
      orderId: shipment.orderId,
    });

    if (linkedOrder) {
      linkedOrder.shipmentId = shipment._id;
      await linkedOrder.save();
    }

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const id = req.params.shipmentId || req.params.id;
    const shipment =
      (await Shipment.findOne({ shipmentId: id })
        .populate("farmerId", "name phone")
        .populate("buyerId", "name phone")
        .populate("sellerId", "name phone")) ||
      (await Shipment.findById(id)
        .populate("farmerId", "name phone")
        .populate("buyerId", "name phone")
        .populate("sellerId", "name phone"));

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (shipment.farmerId._id.toString() !== req.user.id && shipment.buyerId?._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // AI/Pathway integration hook: merge live telemetry when enabled.
    const liveData = await pathwayService.getShipmentLiveData(shipment._id);
    const shipmentObj = shipment.toObject();
    if (liveData) {
      shipmentObj.live = liveData;
    }

    res.json({ success: true, data: shipmentObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyShipments = async (req, res) => {
  try {
    const query = req.user.role === "farmer" ? { farmerId: req.user.id } : { buyerId: req.user.id };
    const shipments = await Shipment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { status, currentLocation, currentTemperature, eta } = req.body;
    const id = req.params.shipmentId || req.params.id;
    const shipment =
      (await Shipment.findOne({ shipmentId: id })) ||
      (await Shipment.findById(id));

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    if (shipment.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only shipment owner can update status" });
    }

    if (status) shipment.status = status;
    if (eta) shipment.eta = eta;

    if (typeof currentTemperature === "number") {
      shipment.currentTemperature = currentTemperature;
      shipment.temperatureHistory.push({ timestamp: new Date(), value: currentTemperature });
    }

    if (typeof currentLocation?.lat === "number" && typeof currentLocation?.lng === "number") {
      const coordinates = [currentLocation.lng, currentLocation.lat];
      shipment.currentLocation = { type: "Point", coordinates };
      shipment.locationHistory.push({ timestamp: new Date(), coordinates });
    }

    await shipment.save();
    res.json({ success: true, data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
