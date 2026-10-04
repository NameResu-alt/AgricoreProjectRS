import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, TextField } from "@mui/material";
import type React from "react";
import axios, { AxiosError, type AxiosResponse } from "axios"
import type { HTTPException } from "../api/schemas/errors";
import { useEffect, useState } from "react";
type InputType = "text" | "number" | "password"

type DialogFields<T> = {
    [K in keyof T]: {
        field: K;
        headerName: string;
        type: InputType;
        options?: T[K][];
        editable?: boolean;
        optional?: boolean;
    }
}[keyof T];

/**
 * T represents the Type that you want to create a dialog for. 
 */

export interface DialogDefinition<T> {
    title: (startingValue?: { value: T, id: number }) => string;
    fields: DialogFields<T>[];
    startingValue?: {
        value: T,
        id: number
    }
    submitAction: (value: T, id?: number) => Promise<void>;
    actionName: string;
    onDialogClose: () => void;
    onErrorOccurred?: (response: HTTPException, setErrorMessage: React.Dispatch<React.SetStateAction<string>>) => void;
    destroyDialog: () => void;
}

export function GenericDialog({ definition, dialogOpen }: { definition: DialogDefinition<any>, dialogOpen: boolean }) {

    const [errorState, setErrorState] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [errorField, setErrorField] = useState("")


    const preparedFields: React.JSX.Element[] = definition.fields.map((field) => {
        return <TextField
            required={field.optional == true}
            error={errorField == String(field.field)}
            key={String(field.field)}
            name={String(field.field)}
            label={field.headerName}
            select={field.options !== undefined}
            defaultValue={definition.startingValue ? definition.startingValue.value![field.field] : undefined}
            type={field.type}
            slotProps={{
                input: {
                    readOnly: field.editable === false,
                },
            }}

            margin={"dense"}
            variant={"outlined"}
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

    /*
    useEffect(() => {
        if (!errorOpen) {
            return;
        }

        const timeout = setTimeout(() => {
            definition.setErrorState?.(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [errorOpen, definition]);
    */

    return (
        <Dialog
            open={dialogOpen}
            onClose={() => {
                definition.onDialogClose()
                setErrorState(false)
            }}
            slotProps={{
                transition: {
                    onExited: definition.destroyDialog
                },
                paper: {
                    component: "form",
                    onSubmit: async (event: any) => {
                        event.preventDefault();
                        const form = event.currentTarget as HTMLFormElement;
                        const formData = new FormData(form);

                        const data = Object.fromEntries(
                            [...formData.entries()].filter(([key, value]) => {
                                return typeof value !== "string" || value.trim() !== "";
                            })
                        );

                        try {
                            await definition.submitAction(
                                data,
                                definition.startingValue?.id
                            );

                            setErrorState(false);
                            setErrorField("");
                            definition.onDialogClose();
                        } catch (ex) {
                            if (ex instanceof AxiosError) {
                                const error = ex.response?.data;

                                definition.onErrorOccurred?.(
                                    error,
                                    setErrorMessage
                                );

                                setErrorField(error?.field ?? "");
                                setErrorState(true);
                            } else {
                                alert(`This shouldn't be possible: ${JSON.stringify(ex)}`);
                            }
                        }
                    },
                    sx: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "500px",
                        maxWidth: "90vw"
                    }
                }
            }}
        >
            <DialogTitle sx={{ alignSelf: "center" }}>
                {definition.title(definition.startingValue)}
            </DialogTitle>
            {
                errorState &&
                <Alert sx={{ width: "100%" }} variant="filled" severity="error">
                    {errorMessage}
                </Alert>
            }

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {preparedFields}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => definition.onDialogClose()}>
                    Cancel
                </Button>
                <Button variant={"contained"} type={"submit"}>
                    {definition.actionName}
                </Button>
            </DialogActions>


        </Dialog>
    )
}