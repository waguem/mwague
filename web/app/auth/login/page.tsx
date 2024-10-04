import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import ComponentsAuthUnlockForm from "@/components/auth/components-auth-unlock-form";
import Image from "next/image";
export const metadata: Metadata = {
  title: "Login",
};
const CoverLockScreen = () => {
  return (
    <div>
      <div className="absolute inset-0">
        <Image
          height={856}
          width={1946}
          src="/assets/images/auth/bg-gradient.png"
          alt="image"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        <Image
          height={263}
          width={693}
          src="/assets/images/auth/coming-soon-object1.png"
          alt="image"
          className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2"
        />
        <Image
          height={225}
          width={225}
          src="/assets/images/auth/coming-soon-object2.png"
          alt="image"
          className="absolute left-24 top-0 h-40 md:left-[30%]"
        />
        <Image
          height={912}
          width={576}
          src="/assets/images/auth/coming-soon-object3.png"
          alt="image"
          className="absolute right-0 top-0 h-[300px]"
        />
        <Image
          height={203}
          width={403}
          src="/assets/images/auth/polygon-object.svg"
          alt="image"
          className="absolute bottom-0 end-[28%]"
        />
        <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
            <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
              <Link href="/" className="ms-10 block w-48 lg:w-72">
                {/* <Image height={64} width={280} src="/assets/images/auth/logo-white.svg" alt="Logo" className="w-full" /> */}
              </Link>
              <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                <Image
                  height={522}
                  width={522}
                  src="/assets/images/auth/login.svg"
                  alt="Cover Image"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
              <Link href="/" className="block w-8 lg:hidden">
                <Image width={56} height={49} src="/assets/images/logo.svg" alt="Logo" className="mx-auto w-10" />
              </Link>
            </div>
            <div className="w-full max-w-[440px] lg:mt-16">
              <ComponentsAuthUnlockForm />
            </div>
            <p className="absolute bottom-6 w-full text-center dark:text-white">
              © {new Date().getFullYear()}.MWAGUE All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLockScreen;
