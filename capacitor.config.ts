import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.bized.app',
    appName: 'Bized',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
