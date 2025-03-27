import GlassCard from "@/components/ui/GlassCard";
import Image from "next/image";

const testimonials = [
  {
    quote: "Partnering with VidalSigns has added tremendous value to our gym membership. Our clients love the personalized lab analysis they receive with their fitness assessments.",
    author: "Alex Thompson",
    title: "Owner, Elite Fitness Center",
    image: "https://media.gettyimages.com/id/1328677010/photo/successful-businessman.jpg?s=612x612&w=0&k=20&c=IJQgFZX36U7l5ChYjfQJVmFIQh1plJmr2r1zQRRPLuA="
  },
  {
    quote: "The QR code system is brilliant. Our wellness center members simply scan, upload their labs, and get instant insights. It's the perfect complement to our holistic health approach.",
    author: "Dr. Maya Patel",
    title: "Director, Harmony Wellness Center",
    image: "https://media.gettyimages.com/id/1370642445/photo/portrait-of-mid-50s-corporate-professional-in-meeting-room.jpg?s=612x612&w=0&k=20&c=zr7LK8uEecrLIWjXX2nE6BPjnAwovLPVC8gofbC-DUA="
  },
  {
    quote: "Since becoming a VidalSigns partner, we've seen a 40% increase in client retention. The branded lab reports reinforce our commitment to science-based wellness solutions.",
    author: "Chris Rodriguez",
    title: "CEO, LifeBalance Health Club",
    image: "https://i.ibb.co.com/7J7b22YR/Screenshot-2025-03-23-014735.png"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Wellness Partners
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our partners say about offering branded lab interpretation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <GlassCard 
              key={index}
              className="p-8 flex flex-col h-full"
              animation="fade"
            >
              <div className="mb-6 flex-grow">
                <svg className="h-8 w-8 text-primary mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-foreground italic">{testimonial.quote}</p>
              </div>
              
              <div className="flex items-center mt-4">
                <div className="mr-4 flex-shrink-0">
                  <Image
                    className="h-12 w-12 rounded-full bg-muted object-cover"
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        
        <div className="mt-20">
          <GlassCard className="p-8 md:p-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Join hundreds of wellness brands that trust VidalSigns
              </h3>
              <p className="text-muted-foreground mb-6">
                From boutique gyms to national wellness networks, VidalSigns helps partners deliver valuable health insights while strengthening their brand loyalty.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-secondary px-4 py-2 rounded-full text-sm font-medium">Simple Integration</div>
                <div className="bg-secondary px-4 py-2 rounded-full text-sm font-medium">Branded Experience</div>
                <div className="bg-secondary px-4 py-2 rounded-full text-sm font-medium">Client Friendly</div>
                <div className="bg-secondary px-4 py-2 rounded-full text-sm font-medium">Value Adding</div>
              </div>
            </div>
            
            <div className="md:w-1/2 grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg aspect-square flex items-center justify-center p-4">
                  <span className="text-muted-foreground text-xs">Partner Logo</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
