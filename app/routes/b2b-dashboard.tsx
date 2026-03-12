import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import db from "../db.server";
import { dashboardService } from "../modules/b2b/services/dashboard.server";
import { dashboardContextToken } from "../modules/b2b/services/dashboard-context-token.server";

type DashboardLoaderData =
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

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return { state: "INVALID_REQUEST" };
  }

  let customerId: string | null;
  try {
    customerId = dashboardContextToken.verify(token).customerId;
  } catch {
    return { state: "INVALID_REQUEST" };
  }

  if (!customerId) {
    return { state: "LOGIN_REQUIRED" };
  }

  const dashboard = await dashboardService.getForCustomer(db, customerId);
  if (dashboard.state === "PENDING_OR_MISSING") {
    return {
      state: "PENDING_OR_MISSING",
      customerId,
      pendingCompanyName: dashboard.pendingCompanyName,
    };
  }

  return {
    state: "APPROVED",
    customerId,
    company: dashboard.company,
    members: dashboard.members,
  };
};

export default function B2BDashboardPage() {
  const data = useLoaderData<typeof loader>();

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
