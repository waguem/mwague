import Header from "@/ui/Header";
import { Hero } from "@/ui/Hero";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/AuthOptions";
type PageProps = {
  params: {
    lang: string;
  };
};
export default async function HomePage(props: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
