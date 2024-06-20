import IconFacebook from "@/components/icon/icon-facebook";
import Image from "next/image";

interface AgentListGridProps {
  filteredItems: any;
}
export default function AgentListGrid({ filteredItems }: AgentListGridProps) {
  return (
    <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {filteredItems.map((contact: any) => {
        return (
          <div
            className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]"
            key={contact.id}
          >
            <div className="relative overflow-hidden rounded-md bg-white text-center shadow dark:bg-[#1c232f]">
              <div className="rounded-t-md bg-white/40 bg-[url('/assets/images/notification-bg.png')] bg-cover bg-center p-6 pb-0">
                <Image
                  className="mx-auto max-h-40 w-4/5 object-contain"
                  src={`/assets/images/user-profile.jpeg`}
                  width={200}
                  height={200}
                  alt="contact_image"
                />
              </div>
              <div className="relative -mt-10 px-6 pb-24">
                <div className="rounded-md bg-white px-2 py-4 shadow-md dark:bg-gray-900">
                  <div className="text-xl">{contact.name}</div>
                  <div className="text-white-dark">{contact.role}</div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-auto">
                      <div className="text-info">{contact.posts}</div>
                      <div>Posts</div>
                    </div>
                    <div className="flex-auto">
                      <div className="text-info">{contact.following}</div>
                      <div>Following</div>
                    </div>
                    <div className="flex-auto">
                      <div className="text-info">{contact.followers}</div>
                      <div>Followers</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ul className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                      <li>
                        <button title="icon" type="button" className="btn btn-outline-primary h-7 w-7 rounded-full p-0">
                          <IconFacebook />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                    <div className="truncate text-white-dark">{contact.email}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                    <div className="text-white-dark">{contact.phone}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                    <div className="text-white-dark">{contact.location}</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 mt-6 flex w-full gap-4 p-6 ltr:left-0 rtl:right-0">
                <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => null}>
                  Edit
                </button>
                <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => null}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
