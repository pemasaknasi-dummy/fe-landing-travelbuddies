import Skeleton from "react-loading-skeleton";

export default function TripListSkeleton() {
  return (
    <div className="rounded-lg ring-1 ring-slate-100 shadow-md space-y-7 py-5">
      <div className="px-5">
        <Skeleton style={{ height: "100px" }} />
      </div>
      <div className="px-5">
        <Skeleton style={{ width: "50%" }} />
        <Skeleton />
        <Skeleton style={{ height: "36px" }} />
      </div>
    </div>
  );
}
