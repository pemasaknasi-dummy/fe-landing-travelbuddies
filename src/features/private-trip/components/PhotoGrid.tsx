import Image from "next/image";

export const PhotoGrid = () => {
  return (
    <>
      {/* ROW 1 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/1.png" width={876} height={492} alt="1" className="w-[219px] h-[123px]" />
        <Image src="/images/community/2.png" width={960} height={492} alt="2" className="w-[240px] h-[123px]" />
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/3.png" width={1036} height={580} alt="1" className="w-[259px] h-[145px]" />
        <Image src="/images/community/4.png" width={804} height={580} alt="2" className="w-[201px] h-[145px]" />
      </div>

      {/* Row 3 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/5.png" width={924} height={780} alt="1" className="w-[231px] h-[195px]" />
        <Image src="/images/community/6.png" width={916} height={780} alt="2" className="w-[229px] h-[195px]" />
      </div>

      {/* Row 4 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/7.png" width={492} height={632} alt="1" className="w-[123px] h-[158px]" />
        <Image src="/images/community/8.png" width={704} height={632} alt="2" className="w-[176px] h-[158px]" />

        <Image src="/images/community/9.png" width={620} height={632} alt="2" className="w-[155px] h-[158px]" />
      </div>

      {/* Row 5 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/10.png" width={636} height={372} alt="1" className="w-[159px] h-[93px]" />
        <Image src="/images/community/11.png" width={556} height={372} alt="2" className="w-[139px] h-[93px]" />

        <Image src="/images/community/12.png" width={624} height={372} alt="2" className="w-[156px] h-[93px]" />
      </div>

      {/* Row 6 */}
      <div className="flex items-center gap-2">
        <Image src="/images/community/13.png" width={984} height={664} alt="1" className="w-[246px] h-[166px]" />
        <Image src="/images/community/14.png" width={864} height={664} alt="2" className="w-[216px] h-[166px]" />
      </div>
    </>
  );
};
