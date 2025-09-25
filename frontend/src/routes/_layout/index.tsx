import { Box, Container } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import ForceGraph from "@/components/Graph/ForceGraph"
import { mockDocuments } from "@/components/Graph/mockDocs"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <Container maxW="full">
      <Box pt={6} m={4}>
        <ForceGraph documents={mockDocuments} />
      </Box>
    </Container>
  );
}
