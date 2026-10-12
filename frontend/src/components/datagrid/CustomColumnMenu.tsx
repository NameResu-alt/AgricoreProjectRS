import { Button, ButtonGroup, Divider, Grid, Stack, Typography } from '@mui/material';
import {
    GridColumnMenuContainer,
    type GridColumnMenuProps,
    useGridApiContext,
} from '@mui/x-data-grid';

import FilterListAltIcon from '@mui/icons-material/FilterListAlt';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { Theme } from '@mui/material/styles';
import React from 'react';
import { date_operators, numeric_operators, string_operators, type CustomFilterModel } from './CustomFilterMenuV2';


export type CustomSortingModel = Record<string, "asc" | "desc" | undefined>
export type CustomColumnMenuProps = GridColumnMenuProps & {
    parentFilterModel: CustomFilterModel
    setFilterModel: React.Dispatch<React.SetStateAction<CustomFilterModel>>
    parentSortingModel: CustomSortingModel;
    setParentSortingModel: React.Dispatch<React.SetStateAction<CustomSortingModel>>
};



export default function CustomColumnMenu({ parentFilterModel, parentSortingModel, setParentSortingModel, setFilterModel, ...props }: CustomColumnMenuProps) {
    const { hideMenu, colDef, color, ...other } = props;

    const apiRef = useGridApiContext();
    let headerElement: HTMLElement | null | undefined = apiRef.current.getColumnHeaderElement(colDef.field);
    headerElement = headerElement?.parentElement

    function updateSortDirection(direction: "asc" | "desc" | undefined) {
        setParentSortingModel((prev) => {
            return { ...prev, [colDef.field]: direction }
        })
    }

    let ascButton = <MenuButton icon={<ArrowUpwardIcon />} text={"Sort by ASC"} operation={() => updateSortDirection("asc")} />
    let descButton = <MenuButton icon={<ArrowDownwardIcon />} text={"Sort by DESC"} operation={() => updateSortDirection("desc")} />
    let unsetButton = <MenuButton icon={<></>} text={"Unset"} operation={() => updateSortDirection(undefined)} />

    let sortingButtons: React.ReactElement[] = []
    const currentSort = parentSortingModel[colDef.field]

    switch (currentSort) {
        case "asc":
            sortingButtons.push(descButton)
            sortingButtons.push(unsetButton)
            break;
        case "desc":
            sortingButtons.push(ascButton)
            sortingButtons.push(unsetButton)
            break;
        default:
            sortingButtons.push(ascButton)
            sortingButtons.push(descButton)
            break;
    }

    const menuButtonSx = {
        display: 'flex',
        width: '100%',
        paddingInline: 0,
        color: 'text.primary',
        textTransform: "none",
        '&:hover': {
            backgroundColor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.08)',
        },
    };



    interface MenuButtonProps {
        icon: React.ReactElement;
        operation: (event: React.SyntheticEvent<Element, Event>) => void;
        text: string;
    }

    function MenuButton({
        icon,
        operation,
        text,
    }: MenuButtonProps): React.ReactElement {
        return (
            <Button
                onClick={operation}
                sx={menuButtonSx}
                variant="text"
                fullWidth
            >
                <Grid container sx={{ flex: 1, width: '100%', height: '100%' }}>
                    <Grid
                        size={2}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Grid>

                    <Grid
                        size={10}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography>{text}</Typography>
                    </Grid>
                </Grid>
            </Button>
        );
    }

    return (
        <GridColumnMenuContainer
            hideMenu={(event) => hideMenu(event)}
            colDef={colDef}
            {...other}
        >
            <Stack sx={{ minWidth: 240 }} spacing={1}>
                <ButtonGroup sx={{ m: 0, p: 0 }} orientation="vertical" fullWidth>
                    {
                        sortingButtons
                    }
                </ButtonGroup>

                <Divider />

                <MenuButton icon={<FilterListAltIcon />} text={"Filter"} operation={(event) => {
                    hideMenu(event)
                    let foundPrevious = false
                    for(let filter of parentFilterModel.filters){
                        if(filter.field === String(colDef.field)){
                            foundPrevious = true
                            break
                        }
                    }
                    let currentFilters = parentFilterModel.filters.map((f)=>({...f}))

                    if(!foundPrevious){

                        let correctOperators = parentFilterModel.fieldFilterOptions[colDef.field]
                        currentFilters.push({
                            id: crypto.randomUUID(),
                            field: colDef.field,
                            operators: correctOperators.options,
                            currentOperator: correctOperators.options[0]
                        })
                    }

                    setFilterModel((prev)=>(
                        {
                            filterMenuParentElement: headerElement!,
                            filters:currentFilters,
                            fieldNames: prev.fieldNames,
                            fieldFilterOptions: prev.fieldFilterOptions,
                            conditionalMode: prev.conditionalMode
                        }
                    ))
                    //setFilterStatus({ open: true, parent: headerElement!, initialColumn: colDef.field })
                }
                }
                />

            </Stack>

        </GridColumnMenuContainer>
    );
}