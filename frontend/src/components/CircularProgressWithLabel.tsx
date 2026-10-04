import { Box, CircularProgress, Typography, type CircularProgressProps } from "@mui/material";

function getProgressColor(value: number) {
    if (value <= 50) {
        // Red (255, 0, 0) -> Yellow (255, 255, 0)
        const green = Math.round((value / 50) * 255);
        return `rgb(255, ${green}, 0)`;
    }

    // Yellow (255, 255, 0) -> Green (0, 128, 0)
    const progress = (value - 50) / 50;
    const red = Math.round(255 * (1 - progress));
    const green = Math.round(255 - (127 * progress));

    return `rgb(${red}, ${green}, 0)`;
}


export default function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number },
) {
    const color = getProgressColor(props.value);
    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CircularProgress
                variant="determinate"
                aria-label="Upload photos"
                {...props}
                sx={{
                    color,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: "text.secondary" }}
                >
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}