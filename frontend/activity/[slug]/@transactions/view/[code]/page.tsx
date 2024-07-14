export default async function TransactionDetail({
  params,
}: {
  params: {
    code: string;
  };
}) {
  return <div>{params.code}</div>;
}
