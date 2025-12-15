// Domain Entity: User
// Represents a user of the application

export interface User {
  // Identity
  id: string;
  email: string;
  name: string;
  phone?: string;
  
  // Household membership
  household_ids: string[];
  default_household_id?: string;
  
  // Preferences
  timezone: string;
  currency: string;
  locale: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

// Factory function to create a User
// Works for both new users (defaults) and loading existing users (pass all fields)
export function createUser(params: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  household_ids?: string[];
  default_household_id?: string;
  timezone?: string;
  currency?: string;
  locale?: string;
  created_at?: Date;
  updated_at?: Date;
  last_login_at?: Date;
}): User {
  return {
    id: params.id,
    email: params.email,
    name: params.name,
    phone: params.phone,
    household_ids: params.household_ids || [],
    default_household_id: params.default_household_id,
    timezone: params.timezone || 'America/New_York',
    currency: params.currency || 'USD',
    locale: params.locale || 'en-US',
    created_at: params.created_at || new Date(),
    updated_at: params.updated_at || new Date(),
    last_login_at: params.last_login_at,
  };
}

