export type CreemEventType =
  | "subscription.active"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "subscription.expired"
  | "subscription.past_due";

export interface CreemWebhookEvent {
  type: CreemEventType;
  data: {
    customer_email: string;
    customer_id: string;
    product_id: string;
    subscription_id: string;
    current_period_end?: number;
  };
}

export interface CheckoutSession {
  url: string;
  id: string;
}
