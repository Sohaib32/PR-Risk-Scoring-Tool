import { z } from "zod";

export const RiskSchema = z.object({
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  risk_summary: z.string(),
  risk_factors: z.array(z.string()),
  reviewer_focus_areas: z.array(z.string()),
  missing_tests: z.boolean(),
  migration_risk: z.enum(["NONE", "LOW", "HIGH"])
});

export type RiskResult = z.infer<typeof RiskSchema>;
