// import { auth } from "@/auth";
import authOptions from "@/auth.config";
import ContentAnimation from "@/components/layouts/content-animation";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import MainContainer from "@/components/layouts/main-container";
import Overlay from "@/components/layouts/overlay";
import ScrollToTop from "@/components/layouts/scroll-to-top";
import Setting from "@/components/layouts/setting";
import Sidebar from "@/components/layouts/sidebar";
import Portals from "@/components/portals";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserHeader from "@/components/layouts/UserHeader";
// import { redirect } from "next/navigation";
export default async function DefaultLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.accessToken) {
    redirect("/auth/login");
  }
  return (
    <>
      {/* BEGIN MAIN CONTAINER */}
      <div className="relative">
        <Overlay />
        <ScrollToTop />

        {/* BEGIN APP SETTING LAUNCHER */}
        <Setting />
        {/* END APP SETTING LAUNCHER */}

        <MainContainer>
          {/* BEGIN SIDEBAR */}
          <Sidebar />
          {/* END SIDEBAR */}
          <div className="main-content flex min-h-screen flex-col">
            {/* BEGIN TOP NAVBAR */}
            <Header UserHeader={<UserHeader session={session} />} />
            {/* END TOP NAVBAR */}

            {/* BEGIN CONTENT AREA */}
            <ContentAnimation>{children}</ContentAnimation>
            {/* END CONTENT AREA */}

            {/* BEGIN FOOTER */}
            <Footer />
            {/* END FOOTER */}
            <Portals />
          </div>
        </MainContainer>
      </div>
    </>
  );
}
