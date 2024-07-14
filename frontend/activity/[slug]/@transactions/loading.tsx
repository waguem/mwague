import LoaderSkeleton from "@/components/layouts/LoaderSkelleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-6">
        <LoaderSkeleton />
        <LoaderSkeleton />
        <LoaderSkeleton />
        <LoaderSkeleton />
      </div>
    </div>
  );
}
