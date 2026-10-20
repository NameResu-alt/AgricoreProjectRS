import { Box, Button, Paper, Tab, Tabs, useTheme } from "@mui/material"
import { useState } from "react"
import RoleComponent from "./RoleComponent"
import UserTab from "./UserComponent"
import { hasPermission } from "../../context/AuthContext"
import { Permission } from "../../api/schemas/auth"


export default function UserViewComponent() {
    const theme = useTheme()

    const [currentTab, setCurrentTab] = useState(0)

    const availableTabs = [
        ...(hasPermission(Permission.USER_READ)
            ? [{ label: "Users", key: "user", content: <UserTab /> }]
            : []),
        ...(hasPermission(Permission.ROLE_READ)
            ? [{ label: "Roles", key: "role", content: <RoleComponent /> }]
            : []),
    ]

    const tabBarheight = "40px"

    const selectedTab = Math.min(currentTab, availableTabs.length - 1)

    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {availableTabs.length > 0 && (
                <>
                    <Paper
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            height: tabBarheight,
                            flexShrink: 0,
                            width: "100%",
                            display: "flex",
                            boxShadow: theme.shadows[4],
                        }}
                    >
                        <Tabs
                            variant="fullWidth"
                            sx={{ flex: 1 }}
                            value={selectedTab}
                            onChange={(_, newValue: number) =>
                                setCurrentTab(newValue)
                            }
                        >
                            {availableTabs.map((tab) => (
                                <Tab
                                    key={tab.key}
                                    label={tab.label}
                                    sx={{
                                        flex: 1,
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Paper>

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            p: 4,
                            pb: 0,
                            overflowY: "auto",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        {availableTabs[selectedTab]?.content}
                    </Box>
                </>
            )}

            {availableTabs.length === 0 && (
                <Box sx={{ p: 4 }}>
                    You do not have permission to view users or roles.
                </Box>
            )}
        </Box>
    )
}