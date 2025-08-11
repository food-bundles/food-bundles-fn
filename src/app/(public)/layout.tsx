import { Footer } from "@/components/footer";
import Header from "@/components/header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div>
      {children}
      </div>
        <div className=" sticky top-0 z-50  bg-white"> <Header /></div>
          {children}
      <div><Footer /></div>

    </div>    
  );
}