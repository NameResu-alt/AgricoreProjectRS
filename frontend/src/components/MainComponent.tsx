import { Box, Tab, Tabs, Button, Typography } from "@mui/material"
import { useState } from "react"
import { useAuth } from '../context/AuthContext';
import UserTab from "./UserComponent"
import ServiceReportTab from "./ServiceReportComponent"
import FieldJobTab from "./FieldJobComponent"
import FieldHandTab from "./FieldHandComponent"
import FarmTab from "./FarmComponent"
import BusinessTab from "./BusinessComponent"
import EquipmentTab from "./EquipmentComponent"
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import TaskIcon from '@mui/icons-material/Task';
import Logo from "../assets/farm-svgrepo-com.svg"
import { UserRole } from "../api/schemas/auth";


export default function MainPage() {

    const { user, logout } = useAuth()
    const [currentTab, setCurrentTab] = useState(0)

    const userTab = {
        key: "users",
        label: "Users",
        icon: <PersonIcon />,
        content: <UserTab />
    };

    const fieldHandTab = {
        key: "field_hands",
        label: "Field Hands",
        icon: <AccessibilityNewIcon />,
        content: <FieldHandTab />
    }

    const farmTab = {
        key: "farms",
        label: "Farms",
        icon: <AgricultureIcon />,
        content: <FarmTab />
    }

    const equipmentTab = {
        key: "equipment",
        label: "Equipment",
        icon: <HomeRepairServiceIcon />,
        content: <EquipmentTab />
    }

    const fieldJobTab = {
        key: "field_jobs",
        label: "Field Jobs",
        icon: <TaskIcon />,
        content: <FieldJobTab />
    }

    const serviceReportTab = {
        key: "service_reports",
        label: "Service Reports",
        icon: <DocumentScannerIcon />,
        content: <ServiceReportTab />
    }

    const metricsTab = {
        key: "metrics",
        label: "Metrics",
        icon: <AnalyticsIcon />,
        content: <BusinessTab />
    }

    const tabsByRole: Record<UserRole, any> = {
        "Admin": [userTab, fieldHandTab, farmTab, equipmentTab, fieldJobTab, serviceReportTab, metricsTab],
        "Field_Hand": [fieldHandTab, farmTab, equipmentTab, fieldJobTab, serviceReportTab, metricsTab],
        "Auditor": [fieldHandTab, farmTab, equipmentTab, fieldJobTab, serviceReportTab, metricsTab]
    }

    /**
     * 
     * <Box sx={{ pt: tabBarheight, flex: 1, minHeight: 0 }}>
                {currentTab === 0 && <FarmTab />}
                {currentTab === 1 && <BusinessTab />}
                {currentTab === 2 && <Box sx={{ p: 3 }}>Item Three</Box>}
            </Box>
     */

    const tabs = tabsByRole[user!.role]

    const tabBarheight = "80px"

    return (
        <Box component={"main"} sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ height: tabBarheight, width: "100%", display: "flex", flexDirection: "row", position: "fixed", backgroundColor: "white", zIndex: 1000, justifyContent: "space-between" }}>
                <Box sx={{ width: "100px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <img src={Logo} alt="Company Logo" width="150" height="50" />
                    AgriCore
                </Box>
                <Tabs sx={{ backgroundColor: "white", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} value={currentTab} onChange={(event, newValue: number) => setCurrentTab(newValue)}>
                    {
                        tabs.map((tab: any) => {
                            return (
                                <Tab sx={{ flex: 1 }} key={tab.key} label={tab.label} icon={tab.icon} color="white" />

                            )
                        })
                    }
                </Tabs>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "200px", flexDirection: "column" }}>
                    <Typography variant={"body1"}>
                        {user?.sub}
                    </Typography>
                    <Button onClick={() => { logout() }}>Logout</Button>
                </Box>
            </Box>

            <Box sx={{ position: "fixed", top: tabBarheight, bottom: 0, left: 0, right: 0, overflowY: "auto" }}>
                {tabs[currentTab]?.content}
            </Box>
        </Box>
    )
}