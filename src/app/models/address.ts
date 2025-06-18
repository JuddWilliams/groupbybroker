export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode: string;
  lat?: number;
  lng?: number;
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
  optionType: string; // 'Open to Bid', 'For Sale', 'Partner', 'Trade', 'Cover';
  icon: google.maps.Icon;
}
