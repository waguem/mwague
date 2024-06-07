import Link from "next/link";
import clsx from "clsx";
interface NavLinkHeaderProps {
  items: {
    href?: string | null;
    text: string;
  }[];
}
export default function NavLinkHeader({ items }: NavLinkHeaderProps) {
  return (
    <ul className="flex space-x-2 rtl:space-x-reverse">
      {items.map((item, index) => {
        const element = item.href ? (
          <Link href={item.href} className="text-primary hover:underline">
            {item.text}
          </Link>
        ) : (
          <span>{item.text}</span>
        );

        return (
          <li
            key={index}
            className={clsx({
              "before:content-['/'] ltr:before:mr-2 rtl:before:ml-2": index !== 0,
            })}
          >
            {element}
          </li>
        );
      })}
    </ul>
  );
}
