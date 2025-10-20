
import Footer from "@/app/components/shared/Footer";
import Navbar from "@/app/components/shared/Navbar";


type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
  
          <>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </>
     
  );
}
