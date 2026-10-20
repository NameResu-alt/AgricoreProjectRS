import React, { useEffect, useState } from "react";
import type { RoleRead, RoleCreate, RoleUpdate } from "../../api/schemas/role";

import { Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Paper, Stack, Table, TextField, useTheme } from "@mui/material";
import { Permission } from "../../api/schemas/auth";
import apiClient from "../../api/client";
import type { SnackbarState } from "../datagrid/GenericDataGridComponent";

interface PermissionUI {
    label: string;
    value: Permission;
}

interface PermissionGroupInformation {
    headerName: string;
    options: PermissionUI[];
    allPermission?: Permission;
}

function createCrudGroup(
    headerName: string,
    all: Permission,
    read: Permission,
    create: Permission,
    update: Permission,
    remove: Permission,
    extraOptions: PermissionUI[] = []
): PermissionGroupInformation {
    return {
        headerName,
        allPermission: all,
        options: [
            { label: "All", value: all },
            { label: "Read", value: read },
            { label: "Create", value: create },
            { label: "Update", value: update },
            { label: "Delete", value: remove },
            ...extraOptions
        ]

    }
}

const permissionGroups: PermissionGroupInformation[] = [
    {
        headerName: "Health",
        options: [{ label: "Read", value: Permission.HEALTH_READ }]
    },
    {
        headerName: "Business",
        options: [{ label: "Read", value: Permission.BUSINESS_READ }]
    },
    createCrudGroup(
        "Users",
        Permission.USER_ALL,
        Permission.USER_READ,
        Permission.USER_CREATE,
        Permission.USER_UPDATE,
        Permission.USER_DELETE
    )
    ,
    createCrudGroup(
        "Roles",
        Permission.ROLE_ALL,
        Permission.ROLE_READ,
        Permission.ROLE_CREATE,
        Permission.ROLE_UPDATE,
        Permission.ROLE_DELETE,
    ),
    createCrudGroup(
        "Farms",
        Permission.FARM_ALL,
        Permission.FARM_READ,
        Permission.FARM_CREATE,
        Permission.FARM_UPDATE,
        Permission.FARM_DELETE,
    ),
    createCrudGroup(
        "Equipment",
        Permission.EQUIPMENT_ALL,
        Permission.EQUIPMENT_READ,
        Permission.EQUIPMENT_CREATE,
        Permission.EQUIPMENT_UPDATE,
        Permission.EQUIPMENT_DELETE,
    ),
    createCrudGroup(
        "Field Hands",
        Permission.FIELD_HAND_ALL,
        Permission.FIELD_HAND_READ,
        Permission.FIELD_HAND_CREATE,
        Permission.FIELD_HAND_UPDATE,
        Permission.FIELD_HAND_DELETE,
    ),
    createCrudGroup(
        "Field Jobs",
        Permission.FIELD_JOB_ALL,
        Permission.FIELD_JOB_READ,
        Permission.FIELD_JOB_CREATE,
        Permission.FIELD_JOB_UPDATE,
        Permission.FIELD_JOB_DELETE,
        [
            {
                label: "Update Status",
                value: Permission.FIELD_JOB_CHANGE_STATUS,
            },
            {
                label: "Assign Service Report",
                value: Permission.FIELD_JOB_ASSIGN_SERVICE_REPORT,
            },
        ],
    ),
    createCrudGroup(
        "Service Reports",
        Permission.SERVICE_REPORT_ALL,
        Permission.SERVICE_REPORT_READ,
        Permission.SERVICE_REPORT_CREATE,
        Permission.SERVICE_REPORT_UPDATE,
        Permission.SERVICE_REPORT_DELETE,
    ),
]

export interface RoleDialogProps {
    role?: RoleRead,
    open: boolean,
    onClose: () => void,
    onExited: () => void,
    setGetSignal: React.Dispatch<React.SetStateAction<number>>
    setSnackbarState: React.Dispatch<React.SetStateAction<SnackbarState>>
    readOnly?: boolean
}


export default function RoleDialogComponent({ role, open, onClose, onExited, setGetSignal, setSnackbarState, readOnly }: RoleDialogProps) {
    const theme = useTheme()

    const [roleName, setRoleName] = useState(() => role?.name ?? "")
    const [dialogPermissions, setDialogPermissions] = useState(() => new Set(role?.permissions ?? []))
    const [createMode, setCreateMode] = useState(() => role === undefined)

    useEffect(() => {
        if (!open) return

        setRoleName(role?.name ?? "")
        setDialogPermissions(new Set(role?.permissions ?? []))
        setCreateMode(role === undefined)
    }, [open, role])

    function handlePermissionChange(
        group: PermissionGroupInformation,
        option: PermissionUI,
        checked: boolean
    ) {
        setDialogPermissions((previous) => {
            const updated = new Set(previous);
            const allPermission = group.allPermission

            if (allPermission == option.value) {
                if (checked) {
                    group.options.forEach(({ value }) => {
                        if (value !== allPermission) updated.delete(value)
                    })
                    updated.add(allPermission)
                }
                else {
                    updated.delete(allPermission);
                }

                return updated;
            }

            if (allPermission && updated.has(allPermission)) {
                updated.delete(allPermission);
                group.options.forEach(({ value }) => {
                    if (value !== allPermission) updated.add(value)
                })
            }

            if (checked) {
                updated.add(option.value)
            }
            else {
                updated.delete(option.value)
            }

            return updated
        })
    }

    //This is especially annoying, since the standard dialog that I made for the creation of the others just won't 
    //be enough for this one, since it needs a list of permissions. 
    async function handleSubmit(event: HTMLFormElement) {
        event.preventDefault()
        if (createMode) {
            const val: RoleCreate = {
                name: roleName,
                permissions: [...dialogPermissions]
            }

            await apiClient.post("/roles", val)
            setGetSignal((prev) => prev + 1)
            let snack: SnackbarState = {
                open: true,
                options: {
                    message: "Successfully created a new Role",
                    severity: "success",
                    duration: 3000
                }
            }
            setSnackbarState(snack)
        }
        else {
            const val: RoleUpdate = {
                name: roleName,
                permissions: [...dialogPermissions]
            }

            await apiClient.put(`/roles/${role?.id}`, val)

            let snack: SnackbarState = {
                open: true,
                options: {
                    message: `Successfully updated Role ${role?.id}`,
                    severity: "success",
                    duration: 3000
                }
            }
            setGetSignal((prev) => prev + 1)
            setSnackbarState(snack)
        }
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                transition: {
                    onExited: onExited
                },
                paper: {
                    component: "form",
                    onSubmit: (event: any) => {
                        handleSubmit(event)
                    },
                    sx: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "1000px",
                        maxWidth: "90vw",
                        overlay: "none",
                        backgroundColor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.divider}`
                    }
                }
            }}
        >
            <DialogTitle sx={{ alignSelf: "center" }}>
                {readOnly
                    ? `Role ${role?.id}`
                    : createMode
                        ? "Create Role"
                        : `Update Role ${role?.id}`}
            </DialogTitle>

            <DialogContent sx={{ display: "flex", justifyContent: "flex-start", alignItems: "stretch", flexDirection: "column", gap: 3 }}>
                <TextField
                    label="Role name"
                    value={roleName}
                    onChange={(event) => setRoleName(event.target.value)}
                    sx={{ marginTop: 2 }}
                    required
                    fullWidth
                    slotProps={{
                        input: {
                            readOnly,
                        },
                    }}
                />

                <Stack spacing={1} sx={{ width: "100%", display: "flex", overflowY: "scroll", paddingBlock: 1 }} >

                    {
                        permissionGroups.map((group) => (

                            <FormControl
                                key={group.headerName}
                                component="fieldset"
                                variant="standard"
                                fullWidth
                                sx={{ minWidth: 0, border: 0, m: 0 }}
                            >
                                <Divider>
                                    <Chip label={group.headerName} size="small" />
                                </Divider>

                                <Paper
                                    sx={{
                                        display: "flex",
                                        width: "100%",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <FormGroup row>
                                        {
                                            group.options.map((option) => {
                                                const isAllOption = group.allPermission === option.value;

                                                const allSelected = group.allPermission !== undefined && dialogPermissions.has(group.allPermission)

                                                const checked = dialogPermissions.has(option.value) || (!isAllOption && allSelected);

                                                return (
                                                    <FormControlLabel
                                                        key={option.value}
                                                        control={
                                                            <Checkbox
                                                                disabled={readOnly}
                                                                checked={checked}
                                                                onChange={(_, isChecked) => {
                                                                    handlePermissionChange(
                                                                        group,
                                                                        option,
                                                                        isChecked
                                                                    )
                                                                }}
                                                            />
                                                        }
                                                        label={option.label}
                                                        labelPlacement="top"
                                                    />
                                                )

                                            })
                                        }

                                    </FormGroup>
                                </Paper>
                            </FormControl>

                        ))
                    }

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                {!readOnly && (
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={!roleName.trim()}
                    >
                        {createMode ? "Create" : "Update"}
                    </Button>
                )}
            </DialogActions>

        </Dialog>
    )

}