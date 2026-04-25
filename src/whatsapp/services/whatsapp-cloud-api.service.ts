import { Injectable, BadRequestException } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class WhatsappCloudApiService {
  private readonly graphApiVersion =
    process.env.WHATSAPP_GRAPH_API_VERSION || "v20.0";

  async sendTemplateMessage(params: {
    accessToken: string;
    phoneNumberId: string;
    toPhone: string;
    templateName: string;
    languageCode?: string;
    bodyParameters: string[];
  }) {
    const url = `https://graph.facebook.com/${this.graphApiVersion}/${params.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: params.toPhone,
      type: "template",
      template: {
        name: params.templateName,
        language: {
          code: params.languageCode || "en",
        },
        components: [
          {
            type: "body",
            parameters: params.bodyParameters.map((value) => ({
              type: "text",
              text: value,
            })),
          },
        ],
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return {
        payload,
        response: response.data,
        whatsappMessageId: response.data?.messages?.[0]?.id,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to send WhatsApp template message";

      throw new BadRequestException(message);
    }
  }

  async sendTextMessage(params: {
    accessToken: string;
    phoneNumberId: string;
    toPhone: string;
    message: string;
  }) {
    const url = `https://graph.facebook.com/${this.graphApiVersion}/${params.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: params.toPhone,
      type: "text",
      text: {
        preview_url: false,
        body: params.message,
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return {
        payload,
        response: response.data,
        whatsappMessageId: response.data?.messages?.[0]?.id,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to send WhatsApp text message";

      throw new BadRequestException(message);
    }
  }
}