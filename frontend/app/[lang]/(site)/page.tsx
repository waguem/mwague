import Header from "@/ui/Header";
import { Hero } from "@/ui/Hero";
``;
import { redirect } from "next/navigation";
import { auth } from "@/app/";

type PageProps = {
  params: {
    lang: string;
  };
};
export default async function HomePage(props: PageProps) {
  const session = await auth();
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
