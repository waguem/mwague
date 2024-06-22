import IconCaretDown from "@/components/icon/icon-caret-down";
import { AccountResponse } from "@/lib/client";
import Image from "next/image";

const AccountCard = ({ account }: { account: AccountResponse }) => {
  return (
    <div key={account.initials} className="panel flex-1 h-full overflow-hidden border-0 p-0">
      <div className="min-h-[190px] bg-gradient-to-r from-[#5269ce] to-[#160f6b] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center rounded-full bg-black/50 p-1 font-semibold text-white ltr:pr-3 rtl:pl-3">
            <Image
              width={32}
              height={32}
              className="block h-8 w-8 rounded-full border-2 border-white/50 object-cover ltr:mr-1 rtl:ml-1"
              src="/assets/images/profile-34.jpeg"
              alt="avatar"
            />
            {account.initials}
          </div>
          <div className="flex rounded-full bg-warning p-2 text-white">{account.type} Account</div>
        </div>
        <div className="flex items-center justify-between text-white">
          <p className="text-xl">Account Balance</p>
          <h5 className="text-2xl ltr:ml-auto rtl:mr-auto">
            <span className="text-white-light">$</span>
            {account.balance}
          </h5>
        </div>
      </div>
      <div className="-mt-12 grid grid-cols-2 gap-2 px-8">
        <div className="rounded-md bg-white px-4 py-2.5 shadow dark:bg-[#060818]">
          <span className="mb-4 flex items-center justify-between dark:text-white">
            In
            <IconCaretDown className="h-4 w-4 rotate-180 text-success" />
          </span>
          <div className="btn w-full  border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
            $97.99
          </div>
        </div>
        <div className="rounded-md bg-white px-4 py-2.5 shadow dark:bg-[#060818]">
          <span className="mb-4 flex items-center justify-between dark:text-white">
            Out
            <IconCaretDown className="h-4 w-4 text-danger" />
          </span>
          <div className="btn w-full  border-0 bg-[#ebedf2] py-1 text-base text-[#515365] shadow-none dark:bg-black dark:text-[#bfc9d4]">
            $53.00
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-5">
          <span className="rounded-full bg-[#1b2e4b] px-4 py-1.5 text-xs text-white before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-white ltr:before:mr-2 rtl:before:ml-2">
            Pending
          </span>
        </div>
        <div className="flex justify-around px-2 text-center">
          <button type="button" className="btn btn-secondary ltr:mr-2 rtl:ml-2">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
