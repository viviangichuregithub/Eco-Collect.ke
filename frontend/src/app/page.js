"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-12 py-6 z-20 text-[#355E62]">
        <h1 className="text-2xl font-bold">Eco-Collect</h1>
        <div className="flex items-center space-x-8">
          <a href="#home" className="text-[#355E62]">Home</a>
          <a href="#about" className="text-[#355E62]">About</a>
          <a href="#services" className="text-[#355E62]">Services</a>
          <button
            onClick={() => router.push("/auth")}
            className="text-white px-6 rounded-full font-semibold border border-white transition-all duration-300 shadow-lg hover:bg-[#2c4b4f]"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.svg')" }}
      >
        <div className="absolute inset-0 bg-white/10"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 bg-black/30 backdrop-blur-md p-8 text-center text-white max-w-4xl rounded-lg"
        >
          <h1 className="text-3xl md:text-3xl font-bold mb-4">
            "Building a Cleaner Future, One Collection at a Time."
          </h1>
          <p className="text-sm md:text-sm mb-6">
            Eco-Collect is a waste recycling and management program committed to turning everyday 
            waste into renewed resources. We collect, recycle, and repurpose — creating cleaner 
            communities and greener jobs for tomorrow.
          </p>
          <a
            href="#about"
            className="inline-block bg-[#355E62] hover:bg-[#2C4C4F] text-white font-semibold px-6 rounded-full transition-all duration-300"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#355E62] text-white text-center py-6">
        <h2 className="text-3xl font-bold mb-4">About Eco-Collect</h2>
        <p className="text-gray-200 max-w-3xl mx-auto">
          Changing the way communities see waste. Founded on the belief that sustainability starts at home,
          Eco-Collect partners with local organizations, schools, and businesses to reduce landfill use and promote
          a circular economy. Our initiatives include neighborhood recycling drives, e-waste recovery programs, 
          and community education on proper waste management. A future where waste is viewed not as trash, but as opportunity.
        </p>
      </section>

      <section className="bg-white text-[#355E62] py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-48 px-4">
          {[
            { name: "Mohammad Saggaf", img: "/saggaf.svg" },
            { name: "Vivian Gichure", img: "/vivian.svg" },
            { name: "Cyprian Waka", img: "/cyprian.svg" },
          ].map((member, index) => (
            <div
              key={index}
              className="relative w-64 h-80 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
            >
              <Image src={member.img} alt={member.name} fill className="object-cover" />
              <div className="absolute bottom-0 w-full bg-white/50 backdrop-blur-md text-black py-3 px-4 text-center">
                <p className="text-sm">{member.name}</p>
              </div>
              <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="services"
        className="bg-[#ECF1E6] text-[#355E62] py-24 px-6 flex flex-col md:flex-row items-center justify-center gap-12"
      >
        <div className="md:w-1/2">
          <Image
            src="/services.svg"
            alt="Eco Collect services"
            width={500}
            height={400}
            className="rounded-xl shadow-lg object-cover w-full h-[350px]"
          />
        </div>
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Eco-Collect Kenya is dedicated to transforming waste into value. 
            We focus on three main areas — waste collection, recycling, 
            and community education — ensuring cleaner spaces and greener futures.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>♻️ Eco-friendly waste collection and sorting</li>
            <li>🔄 Recycling and repurposing materials</li>
            <li>🌍 Community education and awareness programs</li>
          </ul>
        </div>
      </section>
<footer className="bg-[#355E62] text-white py-12 px-8">
  <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
    <div>
      <h3 className="font-bold mb-3">Quick Links</h3>
      <ul className="space-y-2">
        <li><a href="#home" className="hover:text-[#C8D8B4]">Home</a></li>
        <li><a href="#about" className="hover:text-[#C8D8B4]">About</a></li>
        <li><a href="#services" className="hover:text-[#C8D8B4]">Services</a></li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold">Socials</h3>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-[#C8D8B4]">Facebook</a></li>
        <li><a href="#" className="hover:text-[#C8D8B4]">Twitter</a></li>
        <li><a href="#" className="hover:text-[#C8D8B4]">Instagram</a></li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold mb-3">Contact</h3>
      <p>Email: info@ecocollect.com</p>
      <p>Phone: +254 700 000 000</p>
    </div>
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Image
          src="/bus-logo.svg" 
          alt="Bus Logo"
          width={120}
          height={36}
          className="object-contain"
        />
        <h3 className="font-bold">Newsletter</h3>
      </div>
      
      <form className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-2 w-full sm:flex-1 rounded-md text-black bg-white"
        />
        <button
          type="submit"
          className="bg-[#C8D8B4] text-[#355E62] py-0 px-6 rounded-[64px] font-semibold hover:bg-[#b0c69f] transition-all duration-300"
        >
          Register
        </button>
      </form>
    </div>
  </div>
  <div className="border-t border-[#C8D8B4]/30 pt-4 text-center text-sm opacity-75">
    <p>© {new Date().getFullYear()} Eco-Collect Kenya. All rights reserved.</p>
  </div>
</footer>

    </div>
  );
}
