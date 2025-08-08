import { Footer } from "@/components/footer";

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
      <div><Footer /></div>
    </div>    
  );
}