import { Button, Popover } from "@mantine/core";
import { DatePicker, DatesRangeValue } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const DateRangePicker = () => {
  const [selectedDate, setSelectedDate] = useState<[Date | null, Date | null]>([null, null]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const handleSelectDateRange = (dates: DatesRangeValue) => {
    // will add the date range to the query params
    const params = new URLSearchParams(searchParams);
    if (dates[0]) {
      params.set("from", dates[0].toISOString());
    } else {
      params.delete("from");
    }
    if (dates[1]) {
      params.set("to", dates[1].toISOString());
    } else {
      params.delete("to");
    }
    setSelectedDate(dates);
    if (dates[0] && dates[1]) {
      replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <Popover shadow="md" width={420}>
      <Popover.Target>
        <Button variant="outline" size="xs" radius="md" leftSection={<IconCalendar size={16} />}>
          Date
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <DatePicker type="range" value={selectedDate} onChange={handleSelectDateRange} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default DateRangePicker;
