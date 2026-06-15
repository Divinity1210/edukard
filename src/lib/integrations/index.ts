/**
 * Integration registry — single place to check what's live.
 *
 * Usage:
 *   import { integrationStatus } from "@/lib/integrations";
 *   if (integrationStatus().stripe) { ... }
 */
import * as stripe from "./stripe";
import * as plaid from "./plaid";
import * as circle from "./circle";
import * as sumsub from "./sumsub";

export { stripe, plaid, circle, sumsub };

export function integrationStatus() {
  return {
    stripe: stripe.isConfigured(),
    plaid: plaid.isConfigured(),
    circle: circle.isConfigured(),
    sumsub: sumsub.isConfigured(),
  } as const;
}
