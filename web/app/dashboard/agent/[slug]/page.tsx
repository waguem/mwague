export default async function AgentPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  console.log(params.slug);
  return (
    <div>
      <div className="panel mt-5"></div>
    </div>
  );
}
