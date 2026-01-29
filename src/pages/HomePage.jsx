import { useNavigate } from "react-router-dom";
import { HeartPulse, Landmark, Truck, Hotel } from "lucide-react";

const industries = [
  {
    name: "Hospital Al Hayat",
    industry: "Healthcare",
    icon: HeartPulse,
    description:
      "Clinical documents, medical records, and compliance workflows",
  },
  {
    name: "Qatar Venture Capital",
    industry: "Finance",
    icon: Landmark,
    description: "Invoices, statements, KYC, and regulatory documents",
  },
  {
    name: "Doha Rent A Car",
    industry: "Transportation",
    icon: Truck,
    description: "Car rentals, driver documents, and fleet management",
  },
  {
    name: "The Grand Hotel",
    industry: "Hospitality",
    icon: Hotel,
    description: "Reservations, contracts, and guest documentation",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleSelectIndustry = (business_name, industry) => {
    navigate("/file-upload", {
      state: { name: business_name, industry: industry },
    });
  };

  return (
    <div className='min-h-screen bg-[var(--color-midnight-black)] text-white'>
      {/* Hero Section */}
      <div className='max-w-6xl mx-auto px-6 pt-24 pb-16 text-center'>
        <h1 className='text-4xl md:text-6xl font-semibold tracking-tight'>
          <span className='text-white text-5xl md:text-6xl'></span>{" "}
          <span className='text-5xl md:text-6xl bg-[linear-gradient(90deg,var(--color-electric-blue),var(--color-violet-blue),var(--color-magenta),var(--color-digital-orange))] bg-clip-text text-transparent'>
            DocIQ
          </span>
        </h1>

        <p className='mt-5 text-gray-400 max-w-2xl mx-auto text-base md:text-lg'>
          Intelligent document extraction and automation tailored to your
          industry.
        </p>
      </div>

      {/* Industry Cards */}
      <div className=' max-w-full mx-auto px-15 pb-24 flex justify-center align-center'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {industries.map((industry) => {
            const Icon = industry.icon;

            return (
              <button
                key={industry.name}
                onClick={() =>
                  handleSelectIndustry(industry.name, industry.industry)
                }
                className='
                  group text-left rounded-2xl p-6
                  bg-white/5 backdrop-blur
                  border border-white/10
                  hover:border-[#612df5]/50
                  hover:bg-white/10
                  transition-all duration-300
                  
                '
              >
                {/* Icon */}
                <div
                  className='
                    w-12 h-12 rounded-xl
                    flex items-center justify-center
                    bg-[linear-gradient(45deg,var(--color-electric-blue),var(--color-violet-blue),var(--color-magenta),var(--color-digital-orange))]
                    mb-5
                    group-hover:scale-105 transition
                    mt-5
                  '
                >
                  <Icon className='w-6 h-6 text-white' />
                </div>

                {/* Content */}
                <h3 className='text-lg font-medium mb-2'>{industry.name}</h3>

                <p className='text-sm text-gray-400 leading-relaxed'>
                  {industry.description}
                </p>

                {/* CTA */}
                <div className='mt-2 text-sm text-(--color-magenta) transition flex items-center justify-end'>
                  Learn More <span className='ml-1 text-xl'>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
