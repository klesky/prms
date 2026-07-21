import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Spin, Typography } from "antd";
import { FireOutlined } from "@ant-design/icons";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ResourceUsageCountDto, UsageLogsService } from "open-api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Paragraph } = Typography;

const ResourceUsageReport = () => {
  const { data, isLoading, isError } = useQuery<ResourceUsageCountDto[]>({
    queryKey: ["resourceUsageAnalytics"],
    queryFn: () => UsageLogsService.getResourceUsageAnalytics(),
  });

  return (
    <Card
      title={
        <>
          <FireOutlined style={{ marginRight: 8 }} />
          Resource Usage Analytics
        </>
      }
      style={{ marginBottom: 20 }}
    >
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type="error" showIcon message="Failed to load resource usage analytics" />
      ) : !data || data.length === 0 ? (
        <Paragraph type="secondary">No resources have been used yet.</Paragraph>
      ) : (
        <Bar
          data={{
            labels: data.map((r) => r.resourceName),
            datasets: [
              {
                label: "Uses",
                data: data.map((r) => r.usageCount ?? 0),
                backgroundColor: data.map((_, i) => (i === 0 ? "#fa8c16" : "#1677ff")),
              },
            ],
          }}
          options={{
            responsive: true,
            indexAxis: "y",
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
            },
          }}
        />
      )}
    </Card>
  );
};

export default ResourceUsageReport;
