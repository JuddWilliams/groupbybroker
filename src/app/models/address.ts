export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  text: string;
  email: string;
}

export interface Company {
  id: number;
  companyName: string;
}

export interface ContractorListing {
  address: Address;
  type: string;
  company: Company;  
  private: boolean;
}