import { Footer, Navbar, Sidebar } from "../components";
import { Blog, Hero } from "../sections";

const Page = () => (
  <div className="bg-gradient-to-tl from-gray-600 via-gray-700 to-gray-900 overflow-hidden">
    <Navbar />
    <div className="grid gap-4 lg:grid-cols-7 sm:grid-cols-1">
      <div className="col-span-6">
        <Blog />
      </div>
      <Sidebar />
      <div className="gradient-03 z-0" />
    </div>
    <div className="relative">
      <div className="gradient-04 z-0" />
    </div>
    <Footer />
  </div>
);

export default Page;
