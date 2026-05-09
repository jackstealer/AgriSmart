export const USER_ROLES = Object.freeze({
  FARMER: "farmer",
  BUYER: "buyer",
});

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
});

export const SHIPMENT_STATUS = Object.freeze({
  CREATED: "created",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  DELAYED: "delayed",
  CANCELED: "canceled",
});
