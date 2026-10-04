import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import type React from "react";

type InputType = "text" | "number" | "password"

type DialogFields<T> = {
    [K in keyof T]: {
        field: K;
        headerName: string;
        type: InputType;
        options?: T[K][];
        editable?: boolean
    }
}[keyof T];

/**
 * T represents the Type that you want to create a dialog for. 
 */

export interface DialogDefinition<T> {
    title: string;
    fields: DialogFields<T>[];
    startingValue?: {
        value: T,
        id: number
    }
    submitAction: (value: T, id?: number) => void;
    actionName: string;
    onClose: () => void;
    destroyDialog: () => void;
}

export function GenericDialog({ definition, dialogOpen }: { definition: DialogDefinition<any>, dialogOpen: boolean }) {
    const preparedFields: React.JSX.Element[] = definition.fields.map((field) => {
        return <TextField
            key={String(field.field)}
            name={String(field.field)}
            label={field.headerName}
            select={field.options !== undefined}
            defaultValue={definition.startingValue ? definition.startingValue.value![field.field] : undefined}

            slotProps={{
                input: {
                    readOnly: field.editable === false,
                },
            }}
        >
            {
                field.options?.map((opt) =>
                    <MenuItem key={String(opt)} value={String(opt)}>
                        {String(opt)}
                    </MenuItem>
                )
            }
        </TextField>
    })


    return (
        <Dialog
            open={dialogOpen}
            onClose={definition.onClose}
            slotProps={{
                transition: {
                    onExited: definition.destroyDialog
                },
                paper: {
                    component: "form",
                    action: (formData: FormData) => {
                        const data = Object.fromEntries(
                            [...formData.entries()].filter(([key, value]) => {
                                return typeof value !== 'string' || value.trim() !== '';
                            })
                        );

                        definition.submitAction(data, definition.startingValue?.id)
                    }
                }
            }}
        >
            <DialogTitle>
                {definition.title}
            </DialogTitle>

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pt: 1,
                }}
            >
                {preparedFields}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => definition.onClose()}>
                    Cancel
                </Button>
                <Button variant={"contained"} type={"submit"}>
                    {definition.actionName}
                </Button>
            </DialogActions>

        </Dialog>
    )
}