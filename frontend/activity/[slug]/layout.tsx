// const title = "Agent Acitivity Page"
// export const metadata ={
//     title,
//     openGraph:{
//         title,
//     }
// }

export default function Layout({
  transactions,
  forms,
}: {
  children: React.ReactNode;
  forms: React.ReactNode;
  transactions: React.ReactNode;
}) {
  return (
    <div className="space-x-1 flex h-full">
      <div className="flex-1 border-r-[1px] border-gray-200">{forms}</div>
      <div className="flex-1">
        <div className="flex flex-col space-y-2 h-full">
          <div className="flex-1 border-t-[1px] broder-gray-200">{transactions}</div>
        </div>
      </div>
    </div>
  );
}
