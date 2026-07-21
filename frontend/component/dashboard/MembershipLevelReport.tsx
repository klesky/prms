import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Spin } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
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
import { MembershipLevelUsageReportDto, UsageLogsService } from "open-api";
import { MEMBERSHIP_LEVELS } from "../../utils/membership";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MembershipLevelReport = () => {
  const { data, isLoading, isError } = useQuery<MembershipLevelUsageReportDto[]>({
    queryKey: ["usageReportByLevel"],
    queryFn: () => UsageLogsService.getUsageReportByMembershipLevel(),
  });

  const findFor = (level: string) => data?.find((r) => r.membershipLevel === level);

  return (
    <Card
      title={
        <>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Usage by Membership Level
        </>
      }
      style={{ marginBottom: 20 }}
    >
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type="error" showIcon message="Failed to load membership level report" />
      ) : (
        <Bar
          data={{
            labels: MEMBERSHIP_LEVELS,
            datasets: [
              {
                label: "Passengers",
                data: MEMBERSHIP_LEVELS.map((level) => findFor(level)?.passengerCount ?? 0),
                backgroundColor: "#1677ff",
              },
              {
                label: "Total Uses",
                data: MEMBERSHIP_LEVELS.map((level) => findFor(level)?.usageCount ?? 0),
                backgroundColor: "#faad14",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
            },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
            },
          }}
        />
      )}
    </Card>
  );
};

export default MembershipLevelReport;
