import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export const isNative = Capacitor.isNativePlatform();
export const isIos = Capacitor.getPlatform() === 'ios';

/**
 * Initializes native platform features when running inside the iOS app container.
 * Safely no-ops when running in standard web browsers.
 */
export async function initNativeApp(): Promise<void> {
  if (!isNative) return;

  try {
    // Configure dark status bar matching Vice-Vault dark theme
    await StatusBar.setStyle({ style: Style.Dark });
    if (isIos) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch (err) {
    console.warn('Native status bar configuration warning:', err);
  }

  try {
    // Hide native splash screen once React has mounted and hydrated
    await SplashScreen.hide();
  } catch (err) {
    console.warn('Native splash screen hide warning:', err);
  }
}
