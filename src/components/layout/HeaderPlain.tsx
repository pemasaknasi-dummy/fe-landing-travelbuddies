import Image from "next/image";
import Link from "next/link";

const HeaderPlain = ({ bookingKey }: { bookingKey?: string }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 py-4 px-5">
      <div className="max-w-[1024px] 2xl:max-w-[1440px] mx-auto">
        <div className="flex items-center">
          <Link
            href={"/"}
            onClick={() => bookingKey && localStorage.removeItem(bookingKey)}
          >
            <Image
              src={"/images/logo/logo.png"}
              alt="tb-logo"
              width={130}
              height={50}
              className="w-[100px] md:w-[130px] md:h-[50px]"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderPlain;
