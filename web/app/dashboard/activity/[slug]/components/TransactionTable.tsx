type Transaction = {
  code: string;
  state: string;
  type: string;
  amount: number;
  created_at: string;
  url: string;
};
interface Props {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <>
      <div className="flex items-end justify-between gap-4 mt-4 ml-4">
        <h4 className="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Transactions</h4>
      </div>

      <table className="table mt-8 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <thead className="text-zinc-500 dark:text-zinc-400">
          <tr className="text-xs/5 font-semibold text-zinc-500 dark:text-zinc-400">
            <th className="text-left">Code</th>
            <th className="text-left">State</th>
            <th className="text-left">Type</th>
            <th className="text-left">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {transactions.map((transaction: Transaction) => (
            <tr
              key={transaction.code}
              className="text-xs/5 text-zinc-500 dark:text-zinc-400 hover:cursor-pointer hover:bg-zinc-950/5"
            >
              <td className="py-4">{transaction.code}</td>
              <td className="py-4">
                <span className="badge badge-outline-success">{transaction.state}</span>
              </td>
              <td className="py-4">{transaction.type}</td>
              <td className="py-4">${transaction.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
