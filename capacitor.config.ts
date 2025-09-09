import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eurodoor.app',
  appName: 'Eurodoor',
  webDir: 'build',
  server: {
    // Prod ilova domeningizdan yuklansin
    url: 'https://eurodoor.uz',
    cleartext: false,
    allowNavigation: ['eurodoor.uz', '*.eurodoor.uz']
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    preferredContentMode: 'mobile'
  }
};

export default config;

