"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { Box, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { BreadCrumb } from "primereact/breadcrumb";
import { MenuItem } from "primereact/menuitem";
import { AdminOverviewCard } from "./[adminId]/AdminOverviewCard";
import { UserOverviewCard } from "./[adminId]/user/[userId]/UserOverviewCard";
import { AdminProvider } from "./_components/AdminContext";
import Layout from "@/components/SideMenu";

type AdminSwitchContextValue = {
  interWorkspaceEnabled: boolean;
  setInterWorkspaceEnabled: (enabled: boolean) => void;
};

const AdminSwitchContext = createContext<AdminSwitchContextValue | undefined>(undefined);

export function useAdminSwitch() {
  const context = useContext(AdminSwitchContext);
  if (!context) {
    throw new Error("useAdminSwitch must be used within the admin layout");
  }
  return context;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const adminId = params?.adminId as string | undefined;
  const userId = params?.userId as string | undefined;

  const getQueryValue = (key: string) => {
    const value = searchParams.getAll(key);
    if (value.length === 0) {
      return "Not provided";
    }
    return value.join(", ");
  };

  const queryId = getQueryValue("id");
  const queryName = getQueryValue("name");

  const [activeView, setActiveView] = useState<"admin" | "user">(() => (pathname?.includes("/user/") ? "user" : "admin"));
  const resolvedActiveView = pathname?.startsWith("/admin") ? (pathname.includes("/user/") ? "user" : "admin") : activeView;
  const transitionKey = pathname ?? resolvedActiveView ?? "admin";
  const [interWorkspaceEnabled, setInterWorkspaceEnabled] = useState(false);

  const handleInterWorkspaceToggle = (enabled: boolean) => {
    setInterWorkspaceEnabled(enabled);
  };
  
  const breadcrumbItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Console",
        icon: "pi pi-shield",
        command: () => {
          setActiveView("admin");
          router.push("/admin/console/1");
        }
      },
      {
        label: "User",
        icon: "pi pi-user",
        command: () => {
          setActiveView("user");
          router.push("/admin/console/3/user/2?id=1&name=yar");
        }
      }
    ],
    [router]
  );

  const home: MenuItem = useMemo(
    () => ({
      icon: <span className="pi pi-home" aria-label="Home" />,
      url: "/"
    }),
    []
  );

  return (
    <AdminSwitchContext.Provider value={{ interWorkspaceEnabled, setInterWorkspaceEnabled: handleInterWorkspaceToggle }}>
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Admin console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage roles, enforce rate limits, and review access logs across the workspace.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Currently viewing: {resolvedActiveView === "admin" ? "Admin overview" : "User details"}
          </Typography>
        </Box>
        <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <BreadCrumb home={home} model={breadcrumbItems} />
        </Paper>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <FormControlLabel
            control={
              <Switch
                key={`${transitionKey}-${interWorkspaceEnabled ? "on" : "off"}`}
                color="primary"
                checked={interWorkspaceEnabled}
                onChange={(_, checked) => handleInterWorkspaceToggle(checked)}
              />
            }
            label={interWorkspaceEnabled ? "User workspace enabled" : "User workspace disabled"}
          />
        </Stack>
        <Stack spacing={3}>
          {children}
          {adminId ? (
            <AdminProvider adminId={adminId}>
              <AdminOverviewCard adminId={adminId} key={adminId}/>
              {userId ? (
                <>
                  <UserOverviewCard userId={userId} queryId={queryId} queryName={queryName} />
                </>
              ) : (
                <></>
              )}
            </AdminProvider>
          ) : (
            <></>
          )}
        </Stack>
      </Layout>
    </AdminSwitchContext.Provider>
  );
}
