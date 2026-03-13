type MockCompanyMember = {
  id: string;
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
};

type MockCompanyAddress = {
  id: string;
  type: "BILLING" | "SHIPPING";
  label: string | null;
  isDefault: boolean;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string | null;
  zip: string;
  country: string;
  phone: string | null;
};

type MockDashboardData = {
  membershipState: "APPROVED";
  companyName: string;
  orgNumber: string;
  customerName: string;
  companyMembers: MockCompanyMember[];
  addresses: MockCompanyAddress[];
};

export function getMockAppProxyDashboardData(): MockDashboardData {
  return {
    membershipState: "APPROVED",
    companyName: "Reolteknikk Sandbox AS",
    orgNumber: "NO123456789MVA",
    customerName: "Testbruker Sandbox",
    companyMembers: [
      {
        id: "mock-member-1",
        shopifyCustomerId: "10001",
        fullName: "Ola Nordmann",
        email: "ola.nordmann@example.no",
        role: "ADMIN",
        status: "APPROVED",
      },
      {
        id: "mock-member-2",
        shopifyCustomerId: "10002",
        fullName: "Kari Hansen",
        email: "kari.hansen@example.no",
        role: "USER",
        status: "APPROVED",
      },
      {
        id: "mock-member-3",
        shopifyCustomerId: "10003",
        fullName: "Per Berg",
        email: "per.berg@example.no",
        role: "USER",
        status: "PENDING",
      },
    ],
    addresses: [
      {
        id: "mock-addr-1",
        type: "SHIPPING",
        label: "Hovedlager",
        isDefault: true,
        firstName: "Ola",
        lastName: "Nordmann",
        company: "Reolteknikk Sandbox AS",
        address1: "Industriveien 10",
        address2: null,
        city: "Lillestrom",
        province: null,
        zip: "2000",
        country: "Norway",
        phone: "+47 90000001",
      },
      {
        id: "mock-addr-2",
        type: "SHIPPING",
        label: "Prosjekt Oslo Vest",
        isDefault: false,
        firstName: "Kari",
        lastName: "Hansen",
        company: "Reolteknikk Sandbox AS",
        address1: "Drammensveien 120",
        address2: null,
        city: "Oslo",
        province: null,
        zip: "0277",
        country: "Norway",
        phone: "+47 90000002",
      },
      {
        id: "mock-addr-3",
        type: "BILLING",
        label: "Faktura",
        isDefault: true,
        firstName: null,
        lastName: null,
        company: "Reolteknikk Sandbox AS",
        address1: "Postboks 45",
        address2: null,
        city: "Lillestrom",
        province: null,
        zip: "2001",
        country: "Norway",
        phone: null,
      },
    ],
  };
}

export function shouldUseMockAppProxyDashboardData(): boolean {
  // No production env override needed:
  // mock data is only enabled in development mode.
  return process.env.NODE_ENV === "development";
}
