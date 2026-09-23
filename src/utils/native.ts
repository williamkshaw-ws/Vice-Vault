import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Share } from "@capacitor/share";

export const isNative = Capacitor.isNativePlatform();

/**
 * Native Haptic Feedback Helpers
 * Safely executes on native devices; no-ops silently on desktop web.
 */
export const nativeHaptics = {
  /**
   * Subtle tick for increments, decrements, and small toggles
   */
  async impactLight(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  },

  /**
   * Medium bump for modal open/close and standard button clicks
   */
  async impactMedium(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  },

  /**
   * Strong feedback for important triggers
   */
  async impactHeavy(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {}
  },

  /**
   * Double-pulse success notification for adding balls, signing in, saving
   */
  async notificationSuccess(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {}
  },

  /**
   * Warning vibration for deletion prompts or errors
   */
  async notificationWarning(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {}
  },

  /**
   * Quick selection tick for segmented controls and tab switches
   */
  async selectionChanged(): Promise<void> {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch {}
  }
};

/**
 * Native Sharing Helpers
 * Opens the iOS native Share Sheet (AirDrop, Messages, Mail, etc.) with web fallback.
 */
export const nativeShare = {
  /**
   * Share a URL/link via the native iOS share sheet
   */
  async shareLink(options: { url: string; title?: string; text?: string }): Promise<boolean> {
    try {
      if (isNative) {
        const canShare = await Share.canShare();
        if (canShare.value) {
          await Share.share({
            title: options.title || "Vice Vault",
            text: options.text,
            url: options.url,
            dialogTitle: options.title || "Share Golf Bag"
          });
          return true;
        }
      }

      // Web Fallback: Try Web Share API if supported
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: options.title || "Vice Vault",
            text: options.text,
            url: options.url
          });
          return true;
        } catch (shareErr: any) {
          // If user cancelled, don't fallback to clipboard
          if (shareErr.name === "AbortError") return false;
        }
      }

      // Final Fallback: Copy to clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(options.url);
        return true;
      }
    } catch (err) {
      console.warn("Share failed:", err);
    }
    return false;
  }
};
