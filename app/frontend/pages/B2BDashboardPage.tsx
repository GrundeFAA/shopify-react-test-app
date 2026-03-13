type DashboardViewData =
  | {
      state: "INVALID_REQUEST";
    }
  | {
      state: "LOGIN_REQUIRED";
    }
  | {
      state: "PENDING_OR_MISSING";
      customerId: string;
      pendingCompanyName: string | null;
    }
  | {
      state: "APPROVED";
      customerId: string;
      company: {
        id: string;
        name: string;
        orgNumber: string | null;
      };
      members: Array<{
        id: string;
        shopifyCustomerId: string;
        role: string;
        status: string;
      }>;
    };

type B2BDashboardPageProps = {
  data: DashboardViewData;
};

export function B2BDashboardPage({ data }: B2BDashboardPageProps) {
  if (data.state === "INVALID_REQUEST") {
    return (
      <main>
        <h1>B2B Dashboard</h1>
        <p>This page must be opened through the Shopify storefront proxy route.</p>
      </main>
    );
  }

  if (data.state === "LOGIN_REQUIRED") {
    return (
      <main>
        <h1>B2B Dashboard</h1>
        <p>Please log in to your customer account to view this dashboard.</p>
      </main>
    );
  }

  if (data.state === "PENDING_OR_MISSING") {
    return (
      <main>
        <h1>B2B Dashboard</h1>
        <p>Customer ID: {data.customerId}</p>
        <p>Membership status: pending or not found.</p>
        {data.pendingCompanyName ? <p>Company request: {data.pendingCompanyName}</p> : null}
      </main>
    );
  }

  return (
    <main>
      <h1>B2B Dashboard</h1>
      <p>Customer ID: {data.customerId}</p>

      <section>
        <h2>Company</h2>
        <p>Name: {data.company.name}</p>
        <p>Org number: {data.company.orgNumber ?? "N/A"}</p>
      </section>

      <section>
        <h2>Members</h2>
        <ul>
          {data.members.map((member) => (
            <li key={member.id}>
              {member.shopifyCustomerId} - {member.role} ({member.status})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
