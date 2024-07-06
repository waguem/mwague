import { TransactionResponse } from "@/lib/client";
import PerfectScrollbar from "@/components/layouts/PerfectScroll";
function Internal({ transaction }: { transaction: TransactionResponse }) {
  return (
    <div>
      <div className="group relative flex items-center py-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary ltr:mr-1 rtl:ml-1.5"></div>
        <div className="flex-1 tex-xs">
          ${transaction.amount} with Rate : ${transaction.rate}
        </div>
        <div className="text-xs text-white-dark ltr:ml-auto rtl:mr-auto dark:text-gray-500">Just Now</div>
        <span className="badge badge-outline-primary absolute bg-primary-light text-xs opacity-0 group-hover:opacity-100 ltr:right-0 rtl:left-0 dark:bg-black">
          Pending
        </span>
      </div>
      <div className="group relative flex items-center py-1">
        <div className="h-1.5 w-1.5 rounded-full bg-warning ltr:mr-1 rtl:ml-1.5"></div>
        <div className="flex-1 tex-xs">
          ${transaction.amount} with Rate : ${transaction.rate}
        </div>
        <div className="text-xs text-white-dark ltr:ml-auto rtl:mr-auto dark:text-gray-500">Just Now</div>
        <span className="badge badge-outline-primary absolute bg-primary-light text-xs opacity-0 group-hover:opacity-100 ltr:right-0 rtl:left-0 dark:bg-black">
          Pending
        </span>
      </div>
      <div className="group relative flex items-center py-1">
        <div className="h-1.5 w-1.5 rounded-full bg-warning ltr:mr-1 rtl:ml-1.5"></div>
        <div className="flex-1 tex-xs">
          ${transaction.amount} with Rate : ${transaction.rate}
        </div>
        <div className="text-xs text-white-dark ltr:ml-auto rtl:mr-auto dark:text-gray-500">Just Now</div>
        <span className="badge badge-outline-primary absolute bg-primary-light text-xs opacity-0 group-hover:opacity-100 ltr:right-0 rtl:left-0 dark:bg-black">
          Pending
        </span>
      </div>
      <div className="group relative flex items-center py-1">
        <div className="h-1.5 w-1.5 rounded-full bg-warning ltr:mr-1 rtl:ml-1.5"></div>
        <div className="flex-1 tex-xs">
          ${transaction.amount} with Rate : ${transaction.rate}
        </div>
        <div className="text-xs text-white-dark ltr:ml-auto rtl:mr-auto dark:text-gray-500">Just Now</div>
        <span className="badge badge-outline-primary absolute bg-primary-light text-xs opacity-0 group-hover:opacity-100 ltr:right-0 rtl:left-0 dark:bg-black">
          Pending
        </span>
      </div>
    </div>
  );
}
export default function TransactionInfo({ transaction, ...props }: { transaction: TransactionResponse | null }) {
  if (!transaction) return null;
  return (
    <PerfectScrollbar
      className="chat-users relative h-full max-h-[120px] space-y-0.5 ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5 sm:h-[120px]"
      {...props}
    >
      <Internal transaction={transaction} />
    </PerfectScrollbar>
  );
}
