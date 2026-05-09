export const pathwayService = {
  // Toggle this when real Pathway integration is wired.
  isEnabled() {
    return false;
  },

  // Placeholder: start stream/session for a shipment.
  async startShipmentMonitoring(_shipmentId, _payload = {}) {
    return null;
  },

  // Placeholder: fetch latest live shipment telemetry from Pathway.
  async getShipmentLiveData(_shipmentId) {
    return null;
  },

  // Placeholder: close stream/session for a shipment.
  async stopShipmentMonitoring(_shipmentId) {
    return null;
  },
};
