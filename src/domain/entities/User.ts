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

// Factory function to create a new User
export function createUser(params: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  locale?: string;
}): User {
  return {
    id: params.id,
    email: params.email,
    name: params.name,
    phone: params.phone,
    household_ids: [],
    timezone: params.timezone || 'America/New_York',
    currency: params.currency || 'USD',
    locale: params.locale || 'en-US',
    created_at: new Date(),
    updated_at: new Date(),
  };
}

