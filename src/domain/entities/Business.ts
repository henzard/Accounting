// Domain Entity: Business
// Represents a business/employer for expense reimbursement tracking

export interface Business {
  // Identity
  id: string;
  household_id: string;
  name: string; // "ACME Corp", "Freelance Client: XYZ", "My Business LLC"
  
  // Type
  type: 'EMPLOYER' | 'CLIENT' | 'OWN_BUSINESS';
  
  // Contact Info (optional)
  contact_email?: string;
  contact_phone?: string;
  
  // Settings
  default_reimbursement_type: 'REIMBURSABLE' | 'BUSINESS_OWNED'; // For quick selection
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// Factory function to create a new Business
export function createBusiness(params: {
  id: string;
  household_id: string;
  name: string;
  type: 'EMPLOYER' | 'CLIENT' | 'OWN_BUSINESS';
  created_by: string;
  contact_email?: string;
  contact_phone?: string;
  default_reimbursement_type?: 'REIMBURSABLE' | 'BUSINESS_OWNED';
}): Business {
  return {
    id: params.id,
    household_id: params.household_id,
    name: params.name.trim(),
    type: params.type,
    contact_email: params.contact_email,
    contact_phone: params.contact_phone,
    default_reimbursement_type: params.default_reimbursement_type || 'REIMBURSABLE',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: params.created_by,
  };
}
