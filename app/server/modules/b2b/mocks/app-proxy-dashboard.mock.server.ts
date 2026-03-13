type MockCompanyMember = {
  id: string;
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
};

type MockDashboardData = {
  membershipState: "APPROVED";
  companyName: string;
  orgNumber: string;
  customerName: string;
  companyMembers: MockCompanyMember[];
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
  };
}

export function shouldUseMockAppProxyDashboardData(): boolean {
  // No production env override needed:
  // mock data is only enabled in development mode.
  return process.env.NODE_ENV === "development";
}
