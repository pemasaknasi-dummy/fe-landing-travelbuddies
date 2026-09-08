"use client"

import Skeleton from "react-loading-skeleton";

export const TripDetailSkeleton = () => {
  return (
    <section>
      {/* GALLERY IMAGE */}
      <section>
        <div className="grid grid-flow-col grid-rows-2 gap-2">
          <div className="col-span-2 row-span-2 h-60 md:h-full">
            <Skeleton style={{ height: "100%" }} />
          </div>
          <div className="col-span-1 hidden md:block">
            <Skeleton style={{ height: "100%" }} />
          </div>
          <div className="col-span-1 hidden md:block">
            <Skeleton style={{ height: "200px" }} />
          </div>
        </div>
      </section>

      {/* JUDUL TRIP */}
      <section className=" mt-4">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Skeleton />
            <Skeleton style={{ height: "40px" }} />
            <Skeleton style={{ width: "40%" }} />
          </div>
        </div>
      </section>

      {/* MAIN SECTION */}
      <section className="my-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT SIDE */}
        <div className="order-2 md:order-0 space-y-8">
          {/* Deskripsi */}
          <div>
            <Skeleton style={{ height: "30px", width: "40%", marginBottom: "10px" }} />
            <Skeleton count={6} />
          </div>

          {/* Fasilitas yang didapat */}
          <div>
            <Skeleton style={{ height: "30px", width: "40%", marginBottom: "10px" }} />
            <Skeleton />
          </div>

          {/* Fasilitas yang didapat */}
          <div>
            <Skeleton style={{ height: "30px", width: "40%", marginBottom: "10px" }} />
            <Skeleton />
          </div>

          {/* Meeting Point */}
          <div>
            <Skeleton style={{ height: "30px", width: "40%", marginBottom: "10px" }} />
            <Skeleton />
          </div>

          {/* Itinerary */}
          <div>
            <Skeleton style={{ height: "30px", width: "40%", marginBottom: "10px" }} />
            <Skeleton style={{ height: "500px" }} />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="order-1 md:order-0 flex flex-col gap-2">
          <Skeleton style={{ height: "150px" }} />
          <Skeleton style={{ height: "60px" }} />
          <Skeleton style={{height: "20px"}} />
        </div>
      </section>
    </section>
  );
};
