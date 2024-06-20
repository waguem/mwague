import Image from "next/image";
import Link from "next/link";

interface AgentTableProps {
  filteredItems: any;
}

export default function AgentTable({ filteredItems }: AgentTableProps) {
  return (
    <div className="panel mt-5 overflow-hidden border-0 block w-full space-y-2 overflow-x-auto rounded-lg border-white-dark/20 p-4">
      {filteredItems.map((item: any, index: number) => {
        return (
          <Link
            href={`/dashboard/agent/${item.initials}`}
            key={index}
            className="flex min-w-[625px] items-center justify-between rounded-xl h-10 bg-white p-3 font-semibold
                  text-gray-500 shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] transition-all duration-300 hover:scale-[1.01] hover:text-primary dark:bg-[#1b2e4b]"
          >
            <div className="user-profile">
              <Image
                width={300}
                height={450}
                src={`/assets/images/profile-${Math.min(index + 1, 30)}.jpeg`}
                alt="img"
                className="h-8 w-8 rounded-md object-cover"
              />
            </div>
            <div className={`badge badge-outline-primary border-2 border-dashed`}>{item.initials}</div>
            <div>{item.name}</div>
            <div>{item.email}</div>
          </Link>
        );
      })}
    </div>
  );
}
