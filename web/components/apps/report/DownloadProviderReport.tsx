"use client"
import { ActionIcon,Popover,Button, Loader,} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCalendar, IconDownload, IconLoader } from "@tabler/icons-react";
import { Fragment, useState, useTransition } from "react";
import {format} from "date-fns"
import { getProviderReport } from "@/lib/actions/offices";
import { makeProviderReport } from "@/lib/pdf/generator";
import { ForEx } from "@/lib/client";
export default function DownloadProviderReport({name}:{name:string}){
    // hold the selected date
    const [selectedDate, setSelectedDate] = useState<[Date | null, Date | null]>([null, null]);
    const [pending,startTransition]= useTransition()

    const download = async ()=>{
        try{
            const report: ForEx[] = await getProviderReport(name,selectedDate[0]?.toLocaleDateString(), selectedDate[1]?.toLocaleDateString())
            makeProviderReport(name,{
                start: selectedDate[0]?.toLocaleDateString() ?? new Date().toLocaleDateString(),
                end: selectedDate[1]?.toLocaleDateString() ?? new Date().toLocaleDateString()
            },report)
        }catch(ex){
            console.log(ex)
        }
    }
    return (
        <Fragment>
            <Popover shadow="md" width={420}>
                <Popover.Target>
                    <Button variant="outline" size="md" radius="md" leftSection={<IconCalendar size={16} />}>
                        {format(selectedDate && selectedDate[0] ? selectedDate[0] : new Date(),"MMMM")}
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <DatePicker 
                        type="range"
                        value={selectedDate} 
                        onChange={setSelectedDate} 
                    />
                </Popover.Dropdown>
            </Popover>
            <Button
                variant="outline"
                size="md"
                leftSection={
                <ActionIcon color="blue" variant="outline" radius={"md"}>
                    {pending ? <Loader size={18}/>: <IconDownload size={18} />}
                </ActionIcon>
                }
                onClick={()=> startTransition(()=>download())}
            >
                Download Report
            </Button>
        </Fragment>
    )
}