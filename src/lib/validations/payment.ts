import { z } from "zod";

export const createPaymentSchema = z.object({
  leaseId: z.string().uuid("ID de contrato inválido"),
});

export const webhookEventSchema = z.object({
  event: z.enum([
    "transaction.updated",
    "nequi_token.updated",
    "bancolombia_transfer_token.updated",
  ]),
  data: z.object({
    transaction: z.object({
      id: z.string(),
      reference: z.string(),
      status: z.enum(["APPROVED", "DECLINED", "VOIDED", "ERROR", "PENDING"]),
      amount_in_cents: z.number(),
      currency: z.string(),
      customer_email: z.string().email(),
      payment_method_type: z.string().optional(),
      payment_method: z
        .object({
          type: z.string(),
        })
        .optional(),
      finalized_at: z.string().optional(),
    }),
  }),
  sent_at: z.string(),
  signature: z.object({
    properties: z.array(z.string()),
    timestamp: z.number(),
    checksum: z.string(),
  }),
});
