"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/section-title";

export default function OurLatestCreation() {
    const [isHovered, setIsHovered] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [className, setClassName] = useState("");

    const sectionData = [
        {
            title: "Telemedicine Specialists",
            description: "Connecting patients and doctors remotely, providing expert care from anywhere in the world.",
            image: "https://xcelacore.com/wp-content/uploads/2025/06/doctors-working-in-team-2025-02-12-01-57-59-utc-1200x630.jpg",
            align: "object-center",
        },
        {
            title: "Healthcare Data Analysts",
            description: "Analyzing patient data to improve diagnosis, treatment plans, and healthcare outcomes.",
            image: "https://ik.imagekit.io/edtechdigit/usdsi/content/images/articles/how-is-big-data-analytics-transforming-the-healthcare-industry-updated.jpg",
            align: "object-right",
        },
        {
            title: "Medical Software Engineers",
            description: "Developing innovative healthcare applications to streamline patient management and hospital workflows.",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZDPY11mA5dHucq_Z8NaEZQzDZP_-Ue2SuAw&s",
            align: "object-center",
        },
    ];

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % sectionData.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isHovered, sectionData.length]);

    return (
        <section className="flex flex-col items-center" id="creations">
            <SectionTitle
                title="Our Healthcare Innovations"
                description="Pioneering technologies and expert teams transforming patient care and medical services."
            />

            <div
                className="flex items-center gap-4 h-100 w-full max-w-5xl mt-18 mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {sectionData.map((data, index) => (
                    <motion.div
                        key={data.title}
                        className={`relative group flex-grow h-[400px] rounded-xl overflow-hidden ${
                            isHovered && className ? "hover:w-full w-56" : index === activeIndex ? "w-full" : "w-56"
                        } ${className} ${!className ? "pointer-events-none" : ""}`}
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        onAnimationComplete={() => setClassName("transition-all duration-500")}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <img className={`h-full w-full object-cover ${data.align}`} src={data.image} alt={data.title} />
                        <div
                            className={`absolute inset-0 flex flex-col justify-end p-10 text-white bg-black/50 transition-all duration-300 ${
                                isHovered && className ? "opacity-0 group-hover:opacity-100" : index === activeIndex ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <h1 className="text-3xl font-semibold">{data.title}</h1>
                            <p className="text-sm mt-2">{data.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
