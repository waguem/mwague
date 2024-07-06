import IconCaretDown from "@/components/icon/icon-caret-down";

export default function Pagination() {
  return (
    <ul className="m-auto inline-flex items-center">
      <li>
        <button
          type="button"
          title="Previous"
          className="flex justify-center bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white ltr:rounded-l-full rtl:rounded-r-full dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
        >
          <IconCaretDown className="h-4 w-4 rotate-90 rtl:-rotate-90" />
        </button>
      </li>
      <li>
        <button
          type="button"
          className="flex justify-center bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
        >
          1
        </button>
      </li>
      <li>
        <button
          type="button"
          className="flex justify-center bg-primary px-3.5 py-2 font-semibold text-white transition dark:bg-primary dark:text-white-light"
        >
          2
        </button>
      </li>
      <li>
        <button
          type="button"
          className="flex justify-center bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
        >
          3
        </button>
      </li>
      <li>
        <button
          type="button"
          title="Next"
          className="flex justify-center bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white ltr:rounded-r-full rtl:rounded-l-full dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
        >
          <IconCaretDown className="h-4 w-4 -rotate-90 rtl:rotate-90" />
        </button>
      </li>
    </ul>
  );
}
