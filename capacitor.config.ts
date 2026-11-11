import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'ir.hseassistant.mobile',
  appName: 'دستیار HSE',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: false }
};
export default config;
