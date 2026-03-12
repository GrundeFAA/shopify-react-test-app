import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { B2BDashboardPage } from "../frontend/pages/B2BDashboardPage";
import { dashboardContextToken } from "../server/modules/b2b/services/dashboard-context-token.server";
import { createTrpcCaller } from "../server/trpc/caller.server";

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

  const caller = createTrpcCaller({ request, customerId });
  const dashboard = await caller.b2b.getDashboardForCustomer({ customerId });
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

export default function B2BDashboardRoute() {
  const data = useLoaderData<typeof loader>();
  return <B2BDashboardPage data={data} />;
}
