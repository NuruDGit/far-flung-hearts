import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "Lobebo helped us stay close even when we're 5,000 miles apart. The daily questions are our favorite!",
    author: "Sarah & James",
    location: "NYC & London",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop"
  },
  {
    text: "We love how the shared calendar keeps us coordinated across time zones. Never miss special moments!",
    author: "Maria & Alex",
    location: "Barcelona & Sydney",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop"
  },
  {
    text: "The mood tracking feature has brought us closer together emotionally. We understand each other better now.",
    author: "David & Emma",
    location: "Toronto & Paris",
    image: "https://images.unsplash.com/photo-1521038199265-bc482db0f923?w=400&h=400&fit=crop"
  }
];

export const AuthTestimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full flex flex-col justify-center p-8 lg:p-12">
      <div className="max-w-lg mx-auto">
        <Quote className="w-12 h-12 text-white/80 mb-6" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <p className="text-xl lg:text-2xl text-white leading-relaxed italic">
              "{testimonials[current].text}"
            </p>
            
            <div className="flex items-center gap-4">
              <img
                src={testimonials[current].image}
                alt={testimonials[current].author}
                className="w-14 h-14 rounded-full object-cover shadow-elevation-3"
              />
              <div>
                <p className="font-semibold text-white text-lg">
                  {testimonials[current].author}
                </p>
                <p className="text-sm text-white/80">
                  {testimonials[current].location}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-8 justify-center">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current ? "bg-white w-8" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
