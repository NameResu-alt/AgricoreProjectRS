import {
    ToggleButton,
    ToggleButtonGroup,
    useColorScheme,
} from "@mui/material";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ComputerIcon from "@mui/icons-material/Computer";

export default function LightModeToggleButton() {
    const { mode, setMode } = useColorScheme();

    const handleChange = (
        _: React.MouseEvent<HTMLElement>,
        value: "system" | "light" | "dark" | null
    ) => {
        if (value !== null) {
            setMode(value);
        }
    };

    return (
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleChange}
            orientation="horizontal"
            aria-label="Color scheme"
            
        >
            <ToggleButton
                value="system"
                aria-label="System"
            >
                <ComputerIcon sx={{color: mode != "light" && mode != "dark" ? "primary.main" : "text.primary" }}/>
            </ToggleButton>

            <ToggleButton
                value="light"
                aria-label="Light"
            >
                <LightModeIcon sx={{color: mode == "light" ? "primary.main" : "text.primary" }} />
            </ToggleButton>

            <ToggleButton
                value="dark"
                aria-label="Dark"
            >
                <DarkModeIcon sx={{color: mode == "dark" ? "primary.main" : "text.primary" }}/>
            </ToggleButton>
        </ToggleButtonGroup>
    );
}