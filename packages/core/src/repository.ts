import {
  BenefitRecordSchema,
  type BenefitRecord
} from "@mcp-gen-ui-gateway/schema";
import { fixtureBenefits } from "./fixtures.js";

export interface BenefitRepository {
  search(): Promise<BenefitRecord[]>;
  getById(id: string): Promise<BenefitRecord | undefined>;
}

export class FixtureBenefitRepository implements BenefitRepository {
  private readonly benefits: BenefitRecord[];

  constructor(benefits: BenefitRecord[] = fixtureBenefits) {
    this.benefits = benefits.map((benefit) => BenefitRecordSchema.parse(benefit));
  }

  async search(): Promise<BenefitRecord[]> {
    return this.benefits;
  }

  async getById(id: string): Promise<BenefitRecord | undefined> {
    return this.benefits.find((benefit) => benefit.id === id);
  }
}
