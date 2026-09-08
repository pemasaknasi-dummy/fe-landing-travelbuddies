import Skeleton from "react-loading-skeleton";

export default function FilterTripSkeleton() {
  return (
    <div>
      {/* FILTER BY DURATION */}
      <div className="px-5 py-3 ring-1 ring-slate-300 rounded-lg">
        <Skeleton />

        <div className="grid grid-cols-3 gap-5 mt-5">
          {[1, 2, 3, 4, 5].map((day) => (
            <label key={day} className="space-x-2 flex items-center cursor-pointer">
              <Skeleton style={{ height: "20px", width: "60px" }} />
            </label>
          ))}
        </div>
      </div>

      {/* FILTER BY PRICE */}
      <div className="px-5 py-3 my-5 ring-1 ring-slate-300 rounded-lg">
        <Skeleton style={{ height: "20px" }} />

        {/* INPUT PRICE */}
        <div className="flex items-start gap-5 mt-3">
          {/* MINIMAL */}
          <div className="flex flex-col items-start gap-y-1 w-1/2">
            <Skeleton style={{ height: "40px", width: "100px" }} />
          </div>

          {/* MAXIMAL */}
          <div className="flex flex-col items-start gap-y-1 w-1/2">
            <Skeleton style={{ height: "40px", width: "100px" }} />
          </div>
        </div>

        {/* RADIO BUTTON PRICE */}
        <div className="flex flex-col gap-y-5 my-5">
          <Skeleton count={3} />
        </div>
      </div>

      <Skeleton style={{ height: "45px" }} />
    </div>
  );
}
