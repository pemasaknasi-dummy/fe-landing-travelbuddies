import Image from "next/image";

interface Props {
  image: string;
  link: string;
  width: number;
  height: number;
}

export const SocialMediaBadge = ({ image, link, width, height }: Props) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex size-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus:ring-offset-2`}
    >
      <Image
        src={`/images/social-media/${image}.png`}
        alt={image}
        width={width}
        height={height}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  );
};
