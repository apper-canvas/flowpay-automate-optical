// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for registered devices
let devicesState = [
  {
    Id: 1,
    name: "iPhone 14 Pro",
    type: "mobile",
    location: "San Francisco, CA",
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    trusted: true,
    current: true,
    browser: "Safari",
    ipAddress: "192.168.1.105",
    firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    operatingSystem: "iOS 17.1",
    deviceFingerprint: "fp_abc123def456"
  },
  {
    Id: 2,
    name: "MacBook Pro",
    type: "desktop",
    location: "San Francisco, CA",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    trusted: true,
    current: false,
    browser: "Chrome 120.0",
    ipAddress: "192.168.1.104",
    firstSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    operatingSystem: "macOS 14.0",
    deviceFingerprint: "fp_def456ghi789"
  },
  {
    Id: 3,
    name: "Unknown Device",
    type: "mobile",
    location: "Los Angeles, CA",
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    trusted: false,
    current: false,
    browser: "Chrome Mobile",
    ipAddress: "198.51.100.23",
    firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    operatingSystem: "Android 13",
    deviceFingerprint: "fp_ghi789jkl012",
    suspicious: true
  },
  {
    Id: 4,
    name: "iPad Air",
    type: "tablet",
    location: "San Francisco, CA",
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    trusted: true,
    current: false,
    browser: "Safari",
    ipAddress: "192.168.1.106",
    firstSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    operatingSystem: "iPadOS 17.1",
    deviceFingerprint: "fp_jkl012mno345"
  }
];

let nextDeviceId = Math.max(...devicesState.map(d => d.Id), 0) + 1;

export const deviceService = {
  async getAllDevices() {
    await delay(300);
    try {
      return devicesState.map(device => ({ ...device }));
    } catch (error) {
      throw new Error("Failed to load registered devices");
    }
  },

  async getDeviceById(id) {
    await delay(200);
    try {
      const device = devicesState.find(d => d.Id === parseInt(id));
      if (!device) {
        throw new Error("Device not found");
      }
      return { ...device };
    } catch (error) {
      throw new Error("Failed to load device details");
    }
  },

  async getTrustedDevices() {
    await delay(250);
    try {
      const trusted = devicesState.filter(d => d.trusted);
      return trusted.map(device => ({ ...device }));
    } catch (error) {
      throw new Error("Failed to load trusted devices");
    }
  },

  async getUntrustedDevices() {
    await delay(250);
    try {
      const untrusted = devicesState.filter(d => !d.trusted);
      return untrusted.map(device => ({ ...device }));
    } catch (error) {
      throw new Error("Failed to load untrusted devices");
    }
  },

  async trustDevice(deviceId) {
    await delay(300);
    try {
      const deviceIndex = devicesState.findIndex(d => d.Id === parseInt(deviceId));
      if (deviceIndex === -1) {
        throw new Error("Device not found");
      }

      devicesState[deviceIndex] = {
        ...devicesState[deviceIndex],
        trusted: true,
        suspicious: false,
        updatedAt: new Date().toISOString()
      };

      return { ...devicesState[deviceIndex] };
    } catch (error) {
      throw new Error("Failed to trust device: " + error.message);
    }
  },

  async untrustDevice(deviceId) {
    await delay(300);
    try {
      const deviceIndex = devicesState.findIndex(d => d.Id === parseInt(deviceId));
      if (deviceIndex === -1) {
        throw new Error("Device not found");
      }

      if (devicesState[deviceIndex].current) {
        throw new Error("Cannot untrust current device");
      }

      devicesState[deviceIndex] = {
        ...devicesState[deviceIndex],
        trusted: false,
        updatedAt: new Date().toISOString()
      };

      return { ...devicesState[deviceIndex] };
    } catch (error) {
      throw new Error("Failed to untrust device: " + error.message);
    }
  },

  async remoteLogout(deviceId) {
    await delay(400);
    try {
      const deviceIndex = devicesState.findIndex(d => d.Id === parseInt(deviceId));
      if (deviceIndex === -1) {
        throw new Error("Device not found");
      }

      const device = devicesState[deviceIndex];
      if (device.current) {
        throw new Error("Cannot logout from current device");
      }

      // Remove the device after logout
      const loggedOutDevice = devicesState.splice(deviceIndex, 1)[0];

      return {
        success: true,
        message: `Logged out from ${loggedOutDevice.name}`,
        device: { ...loggedOutDevice }
      };
    } catch (error) {
      throw new Error("Failed to logout device: " + error.message);
    }
  },

  async blockDevice(deviceId) {
    await delay(350);
    try {
      const deviceIndex = devicesState.findIndex(d => d.Id === parseInt(deviceId));
      if (deviceIndex === -1) {
        throw new Error("Device not found");
      }

      const device = devicesState[deviceIndex];
      if (device.current) {
        throw new Error("Cannot block current device");
      }

      // Remove the device and add to blocked list
      const blockedDevice = devicesState.splice(deviceIndex, 1)[0];
      blockedDevice.blocked = true;
      blockedDevice.blockedAt = new Date().toISOString();

      return {
        success: true,
        message: `${blockedDevice.name} has been blocked`,
        device: { ...blockedDevice }
      };
    } catch (error) {
      throw new Error("Failed to block device: " + error.message);
    }
  },

  async registerNewDevice(deviceData) {
    await delay(300);
    try {
      const newDevice = {
        Id: nextDeviceId++,
        name: deviceData.name || "Unknown Device",
        type: deviceData.type || "unknown",
        location: deviceData.location || "Unknown Location",
        lastActive: new Date().toISOString(),
        trusted: false,
        current: deviceData.current || false,
        browser: deviceData.browser || "Unknown Browser",
        ipAddress: deviceData.ipAddress || "0.0.0.0",
        firstSeen: new Date().toISOString(),
        operatingSystem: deviceData.operatingSystem || "Unknown OS",
        deviceFingerprint: `fp_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        suspicious: deviceData.suspicious || false,
        createdAt: new Date().toISOString()
      };

      devicesState.unshift(newDevice);
      return { ...newDevice };
    } catch (error) {
      throw new Error("Failed to register device: " + error.message);
    }
  },

  async updateDeviceLocation(deviceId, location, ipAddress) {
    await delay(200);
    try {
      const deviceIndex = devicesState.findIndex(d => d.Id === parseInt(deviceId));
      if (deviceIndex === -1) {
        throw new Error("Device not found");
      }

      devicesState[deviceIndex] = {
        ...devicesState[deviceIndex],
        location: location,
        ipAddress: ipAddress,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { ...devicesState[deviceIndex] };
    } catch (error) {
      throw new Error("Failed to update device location");
    }
  },

  async getDeviceAnalytics() {
    await delay(300);
    try {
      const total = devicesState.length;
      const trusted = devicesState.filter(d => d.trusted).length;
      const untrusted = devicesState.filter(d => !d.trusted).length;
      const suspicious = devicesState.filter(d => d.suspicious).length;
      const current = devicesState.filter(d => d.current).length;

      const deviceTypes = devicesState.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {});

      const locations = devicesState.reduce((acc, device) => {
        acc[device.location] = (acc[device.location] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        trusted,
        untrusted,
        suspicious,
        current,
        deviceTypes,
        locations,
        recentActivity: devicesState
          .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
          .slice(0, 5)
          .map(d => ({
            deviceName: d.name,
            lastActive: d.lastActive,
            location: d.location,
            trusted: d.trusted
          }))
      };
    } catch (error) {
      throw new Error("Failed to load device analytics");
    }
  },

  async searchDevices(query) {
    await delay(200);
    try {
      const lowercaseQuery = query.toLowerCase();
      const filtered = devicesState.filter(device =>
        device.name.toLowerCase().includes(lowercaseQuery) ||
        device.location.toLowerCase().includes(lowercaseQuery) ||
        device.browser.toLowerCase().includes(lowercaseQuery) ||
        device.operatingSystem.toLowerCase().includes(lowercaseQuery)
      );

      return filtered.map(device => ({ ...device }));
    } catch (error) {
      throw new Error("Failed to search devices");
    }
  }
};