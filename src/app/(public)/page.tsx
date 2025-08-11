import Home from "@/components/home";
import Products from "@/components/featured_products";
import How_It_Works from "@/components/how_it_work";
import WhyChoose from "@/components/why_choose";
import Testimonials from "@/components/testimonials";
export default function Landingpage() {
    return (
      
     <div>
       <Home/>
       <How_It_Works/>
       <Products/>
       <WhyChoose/>
       <Testimonials/>
       </div>
    )
  }