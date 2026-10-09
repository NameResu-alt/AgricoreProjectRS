import { Box, Button, ButtonGroup, Divider, Grid, Stack, Typography } from '@mui/material';
import {
    GridColumnMenu,
    GridColumnMenuContainer,
    type GridColumnMenuProps,
    GridColumnMenuFilterItem,
    GridColumnMenuSortItem,
    useGridApiRef,
    DataGrid,
    type GridSlots,
    useGridApiContext,
} from '@mui/x-data-grid';

import FilterListAltIcon from '@mui/icons-material/FilterListAlt';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { Theme } from '@mui/material/styles';
import React, { useState } from 'react';
import CustomFilterMenu, { type FilterStatus } from './CustomFilterMenu';

interface FilterInformation {
    operator: string,
    value: string
}

export type CustomFilterModel = Record<string, FilterInformation[]>
export type CustomSortingModel = Record<string, "asc" | "desc" | undefined>
export type CustomColumnMenuProps = GridColumnMenuProps & {
    parentFilterModel: CustomFilterModel;
    parentSortingModel: CustomSortingModel;
    setParentFilterModel: React.Dispatch<
        React.SetStateAction<CustomFilterModel>
    >;
    setParentSortingModel: React.Dispatch<React.SetStateAction<CustomSortingModel>>
    setFilterStatus: React.Dispatch<React.SetStateAction<FilterStatus>>
};



export default function CustomColumnMenu({parentFilterModel, parentSortingModel, setParentFilterModel, setParentSortingModel, setFilterStatus, ...props }: CustomColumnMenuProps) {
    const { hideMenu, colDef, color, ...other } = props;

    const apiRef = useGridApiContext();
    let headerElement: HTMLElement | null | undefined = apiRef.current.getColumnHeaderElement(colDef.field);
    headerElement = headerElement?.parentElement

    function updateSortDirection(direction: "asc" | "desc" | undefined) {
        setParentSortingModel((prev) => {
            return { ...prev, [colDef.field]: direction }
        })
    }

    function deleteCurrentFilter(filterIndex: number) {
        setParentFilterModel((prev) => {
            let old_list = prev[colDef.field] ?? []
            let new_list = old_list.filter((_, index) => index !== filterIndex)
                .map((val) => ({ ...val }))

            return { ...prev, [colDef.field]: new_list };
        })
    }

    function updateCurrentFilter(filter: FilterInformation, filterIndex: number) {
        setParentFilterModel((prev) => {
            const list = prev[colDef.field] ?? [];

            const newList = list.map((item, index) =>
                index === filterIndex ? filter : { ...item }
            );

            if (filterIndex >= newList.length) {
                newList.push(filter);
            }

            return {
                ...prev,
                [colDef.field]: newList,
            };
        })
    }
    
    let ascButton = <MenuButton icon={<ArrowUpwardIcon/>} text={"Sort by ASC"} operation={()=>updateSortDirection("asc")}/>
    let descButton = <MenuButton icon={<ArrowDownwardIcon/>} text={"Sort by DESC"} operation={()=>updateSortDirection("desc")}/>
    let unsetButton = <MenuButton icon={<></>} text={"Unset"} operation={()=>updateSortDirection(undefined)}/>
    
    let sortingButtons: React.ReactElement[] = []
    const currentSort = parentSortingModel[colDef.field]

    switch(currentSort){
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
        operation: () => void;
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
            hideMenu={hideMenu}
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

                <MenuButton icon={<FilterListAltIcon/>} text={"Filter"} operation={()=>setFilterStatus({open:true, parent: headerElement!})}/>

            </Stack>
            
        </GridColumnMenuContainer>
    );
}