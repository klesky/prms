import { Typography } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import CrewLeadsPanel from "./CrewLeadsPanel";
import PassengersPanel from "./PassengersPanel";
import ShipResourcesPanel from "./ShipResourcesPanel";
import MembershipLevelReport from "./MembershipLevelReport";
import ResourceUsageReport from "./ResourceUsageReport";

const { Title } = Typography;

const CrewLeadDashboard = () => (
  <Typography>
    <Title level={3}>
      <RocketOutlined style={{ marginRight: 10 }} />
      Crew Lead Dashboard
    </Title>

    <CrewLeadsPanel />
    <PassengersPanel />
    <ShipResourcesPanel />
    <MembershipLevelReport />
    <ResourceUsageReport />
  </Typography>
);

export default CrewLeadDashboard;
