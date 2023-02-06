import { Footer, Navbar, Sidebar } from "../components";
import { Blog, Hero } from "../sections";

const Page = () => (
  <div className="bg-gradient-to-tl from-gray-600 via-gray-700 to-gray-900 overflow-hidden">
    <Navbar />
    <Blog />
    <div className="gradient-03 z-0" />
    <div className="relative">
      <div className="gradient-04 z-0" />
    </div>
    <Footer />
  </div>
);

export default Page;
