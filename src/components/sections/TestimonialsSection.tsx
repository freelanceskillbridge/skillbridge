import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Content Writer",
      membership: "Pro Member",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      content:
        "SkillBridge completely transformed my freelance career. The curated jobs mean I spend less time searching and more time earning. Made $2,200 in my first month! Bearing in mind it was a part-time job, before i declared it full-time",
      rating: 5,
      earnings: "$12,400",
    },
    {
      name: "Marcus Chen",
      role: "Data Analyst",
      membership: "VIP Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "Unlike other platforms, there's no racing to the bottom on price. Clients here value quality, and the guaranteed payments give me peace of mind.",
      rating: 5,
      earnings: "$28,750",
    },
    {
      name: "Emily Rodriguez",
      role: "Virtual Assistant",
      membership: "Pro Member",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content:
        "The membership model actually works in our favor. Higher barrier to entry means better clients and consistent work. Best decision I've made.",
      rating: 5,
      earnings: "$8,900",
    },
    {
      name: "David Kim",
      role: "Graphic Designer",
      membership: "VIP Member",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content:
        "Priority review and unlimited tasks as a VIP member means I can scale my income without limits. The platform really invests in serious freelancers.",
      rating: 5,
      earnings: "$45,200",
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Trusted by{" "}
            <span className="gradient-text">Thousands of Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how freelancers like you are building sustainable careers on SkillBridge
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card-hover p-8"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/30 mb-6" />
              
              {/* Content */}
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.membership}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{testimonial.earnings}</div>
                  <div className="text-xs text-muted-foreground">Total Earned</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
