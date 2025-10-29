"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useKeenSlider } from "keen-slider/react";
import {
  CircleChevronLeft,
  CircleChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "keen-slider/keen-slider.min.css";
import { api } from "@/data/api";

type BannerItem = {
  _id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  status: string;
};

export default function Banner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  // Fetch banner data
  useEffect(() => {
    let ignore = false;

    const fetchBanners = async () => {
      try {
        const res = await fetch(`${api}/banner`);
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          const approvedBanners = json.data.filter(
            (item: BannerItem) => item.status === "approved"
          );
          setBanners(approvedBanners);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (!instanceRef.current) return;

    timerRef.current = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [instanceRef]);

  useEffect(() => {
    if (!loaded || !instanceRef.current) return;

    timerRef.current = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loaded, instanceRef]);

  if (banners.length === 0) return null; // You can replace with loader if needed

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50 pt-10 md:pt-0 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f25b29' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div
        ref={sliderRef}
        className="keen-slider w-full h-auto md:h-[700px] relative"
      >
        <AnimatePresence mode="wait">
          {banners.map((banner, index) => (
            <motion.div
              className="keen-slider__slide"
              key={banner._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-12">
                {/* Text Content */}
                <motion.div
                  className="md:w-1/2 text-center md:text-left space-y-6 z-10"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <motion.h1
                    className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {banner.title}
                  </motion.h1>

                  <motion.p
                    className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {banner.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Button className="group px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      {banner.buttonText}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Image */}
                <motion.div
                  className="md:w-1/2 flex justify-center"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-3xl opacity-20 transform rotate-6 scale-110"></div>
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      width={500}
                      height={400}
                      className="relative rounded-3xl object-contain max-h-[400px] md:max-h-[500px] shadow-2xl"
                      priority={index === 0}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dots */}
      {loaded && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {banners.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={clsx(
                "w-4 h-4 rounded-full transition-all duration-300",
                currentSlide === idx
                  ? "bg-orange-500 scale-125 shadow-lg"
                  : "bg-white/60 hover:bg-white/80 border-2 border-orange-200"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>
      )}

      {/* Arrows */}
      {loaded && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={() => instanceRef.current?.prev()}
              className="absolute top-1/2 left-6 transform -translate-y-1/2 rounded-full z-20 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl border-0 hover:bg-white transition-all duration-300"
              aria-label="Previous Slide"
            >
              <CircleChevronLeft className="w-6 h-6 text-orange-500" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={() => instanceRef.current?.next()}
              className="absolute top-1/2 right-6 transform -translate-y-1/2 rounded-full z-20 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl border-0 hover:bg-white transition-all duration-300"
              aria-label="Next Slide"
            >
              <CircleChevronRight className="w-6 h-6 text-orange-500" />
            </Button>
          </motion.div>
        </>
      )}
    </motion.section>
  );
}
