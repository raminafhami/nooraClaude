import dynamic from "next/dynamic";

export const parseDevice = async (userAgent: string) => {
  const { default: DeviceDetector } = await import("device-detector-js");

  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);
  return device;
};
