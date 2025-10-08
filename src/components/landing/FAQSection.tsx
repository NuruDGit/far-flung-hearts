import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What makes Lobebo different from other relationship apps?",
    answer: "Lobebo is specifically designed for long-distance couples, offering features like synchronized calendars, mood tracking, AI relationship advice, and a private memory vault - all in one beautiful, secure platform."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use end-to-end encryption for all messages and implement industry-standard security practices. Your data is stored securely and never shared with third parties."
  },
  {
    question: "Can I try Lobebo before subscribing?",
    answer: "Yes! We offer a free tier that includes essential features like messaging, calendar sharing, and limited mood tracking. You can upgrade anytime to unlock premium features."
  },
  {
    question: "What happens if my partner doesn't have the app?",
    answer: "You can easily invite your partner through email or by sharing a unique pairing code. They'll receive a link to download the app and connect with you instantly."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and support various payment methods through our secure payment partner, Stripe."
  }
];

export const FAQSection = () => {
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto py-16"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 bg-gradient-to-r from-love-heart to-love-deep bg-clip-text text-transparent">
        Frequently Asked Questions
      </h3>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <AccordionItem 
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card shadow-elevation-1 hover:shadow-elevation-2 transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-love-heart">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
};
