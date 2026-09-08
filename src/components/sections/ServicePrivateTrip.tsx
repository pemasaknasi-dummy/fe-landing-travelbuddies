import Image from "next/image";

export interface Service {
  title: string;
  desc: string;
  color: string;
  image: string;
}

export interface ServiceProps {
  service: Service;
  isLast?: boolean;
}

export const ServicePrivateTrip = ({ service, isLast }: ServiceProps) => {
  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-[480px] ${service.title === "Komunitas/Group Trip" && "md:col-span-1 lg:col-span-2"} ${isLast && "md:col-span-2"}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <Image src={service.image} alt={service.title} fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-black/10"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{service.title}</h3>
        <p className="text-gray-200 text-sm md:text-base items-end">{service.desc}</p>
      </div>

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
    </div>
  );
};
