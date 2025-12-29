"use client";

import { Paper, Stack, Typography, Box } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { InterWorkspaceSection } from "../_components/InterWorkspaceSection";
import Layout from "../../../../components/SideMenu";

const formatQueryValue = (value: string | null) => value ?? "Not provided";

export default function AdminInnerWorkspacePage() {
  const params = useParams<{ innerId?: string }>();
  const searchParams = useSearchParams();

  const innerId = params?.innerId ?? "Unknown";
  const queryId = formatQueryValue(searchParams.get("id"));
  const queryName = formatQueryValue(searchParams.get("name"));

  return (
    <Layout>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={3}>
            <InterWorkspaceSection
                title="Inter workspace"
                description="Review cross-workspace touchpoints without entering the admin console."
            />
        </Stack>
        <Stack spacing={1} sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700}>
                    Inter workspace metadata
                </Typography>
                <Typography variant="body1">Inner id from path: {innerId}</Typography>
                <Typography variant="body2">Query parameter id: {queryId}</Typography>
                <Typography variant="body2">Query parameter name: {queryName}</Typography>
                <Typography variant="caption" color="text.secondary">
                    This view is routed at /admin/inner/:innerId but is rendered outside the admin console layout for dedicated focus.
                </Typography>
                </Stack>
            </Paper>
        </Stack>
      </Box>
    </Layout>
  );
}
