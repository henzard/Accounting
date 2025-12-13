// Domain Entity: Household
// Represents a shared financial workspace for couples/families

export type BabyStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Household {
  // Identity
  id: string;
  name: string;
  
  // Membership
  owner_id: string;
  member_ids: string[];
  
  // Settings
  timezone: string;
  currency: string;
  
  // Dave Ramsey Setup
  current_baby_step: BabyStep;
  baby_step_started_at?: Date;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Household
export function createHousehold(params: {
  id: string;
  name: string;
  owner_id: string;
  timezone?: string;
  currency?: string;
  current_baby_step?: BabyStep;
}): Household {
  return {
    id: params.id,
    name: params.name,
    owner_id: params.owner_id,
    member_ids: [params.owner_id], // Owner is first member
    timezone: params.timezone || 'America/New_York',
    currency: params.currency || 'USD',
    current_baby_step: params.current_baby_step || 1,
    baby_step_started_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.owner_id,
  };
}

