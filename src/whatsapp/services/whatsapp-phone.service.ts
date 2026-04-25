import { Injectable } from "@nestjs/common";

@Injectable()
export class WhatsappPhoneService {
  normalizeSriLankanPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = `94${cleaned.substring(1)}`;
    }

    if (cleaned.startsWith("94")) {
      return cleaned;
    }

    return cleaned;
  }
}