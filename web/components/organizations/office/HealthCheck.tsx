"use client"
import { AccountResponse, OfficeHealth } from "@/lib/client";
import { getMoneyPrefix } from "@/lib/utils";
import { Badge, Box, Indicator, NumberFormatter,  Stack } from "@mantine/core";
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";

interface Props{
    health: OfficeHealth
}


function AccountSummary({accounts}:{accounts:AccountResponse[]}){
    

    const columns = useMemo<MRT_ColumnDef<AccountResponse>[]>(() => [
        {
            accessorKey:"initials",
            header:"Initials",
            size:30,
            Cell:({cell, row})=>(
                <Badge variant="dot" color={row.original.balance >= 0 ? "teal":"red"}>
                    {cell.getValue() as string}
                </Badge>
            )
        },
        {
            accessorKey:"type",
            header:"Type",
            Cell:({cell})=>(
                <Badge variant="dot" color={cell.getValue() === "FUND" ? "blue":"teal"}>
                    {cell.getValue() as string}
                </Badge>
            )
        },
        {
            accessorKey:"balance",
            header:"Balance",
            Cell:({cell,row})=>(
                <Badge variant="dot" color={(cell.getValue() as number) >= 0 ? "teal":"red"}>
                    <NumberFormatter
                        value={cell.getValue() as number}
                        thousandSeparator=","
                        decimalScale={2}
                        prefix={getMoneyPrefix(row.original.currency)}
                    />
                </Badge>
            )
        }
    ], [])
    
    const table = useMantineReactTable({
        columns,
        data: [...accounts],
        enablePagination:false,
        enableFullScreenToggle:false,
        enableHiding:false,
        enableBottomToolbar:false,
        enableStickyHeader:true,
        mantineTableProps: () => ({
            striped: true
        }),
        mantineTableContainerProps:()=> ({
            style:{
                height:"390px",
                width:"100%"
            }
        })
    })

    return (
        <MantineReactTable
            table={table}
        />
    )
}
export function HealthCheck({health}:Props){
    return (
        <Stack>
            <Box>
                <Indicator inline processing color={health?.status==="healthy"? "teal":"red"} size={12}>
                    <Badge variant="dot" color={health?.status==="healthy"? "teal":"red"}>
                        Invariant is <NumberFormatter value={health.invariant} thousandSeparator="," decimalScale={5}/> 
                    </Badge>
                </Indicator>
            </Box>
            <AccountSummary
                accounts={health.accounts}
            />
        </Stack>
    )
}