export interface WhatsAppConfig {
  phoneNumber: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  qrCodeUrl?: string;
}

export class WhatsAppService {
  private static config: WhatsAppConfig = {
    phoneNumber: '05305631781',
    isConnected: true,
    lastConnectedAt: new Date().toISOString()
  };

  public static getConfig(): WhatsAppConfig {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('whatsapp_bot_config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch {}
      }
    }
    return this.config;
  }

  public static saveConfig(config: Partial<WhatsAppConfig>): WhatsAppConfig {
    const updated = { ...this.getConfig(), ...config };
    if (typeof window !== 'undefined') {
      localStorage.setItem('whatsapp_bot_config', JSON.stringify(updated));
    }
    return updated;
  }

  public static async sendWhatsappNotification(phone: string, message: string): Promise<boolean> {
    console.log(`[WhatsApp Bot -> ${phone}]: ${message}`);
    return true;
  }
}
