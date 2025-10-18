"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";

function getRandomSpeed(type) {
  if (type === "turn") {
    return Math.random() * (1.5 - 0.7) + 0.7; // slower on turns
  } 
  else 
  {
    return Math.random() * (1.5 - 0.6) + 0.6; // faster and more random on straights
  }
  return 1;
}

function getSegmentType(point) {
  return point.turn.toLowerCase().includes("turn") ? "turn" : "straight";
}

export default function RacerDot({ trackPath, color = "#facc15", delay = 0 }) {
  const controls = useAnimation();

  React.useEffect(() => {
    let isMounted = true;

    async function animateLoop() {
      while (isMounted) {
        for (let i = 0; i < trackPath.length - 1; i++) {
          const to = trackPath[i + 1];
          const segmentType = getSegmentType(to);
          const segmentSpeed = getRandomSpeed(segmentType);

          await controls.start({
            left: `${to.x}%`,
            top: `${to.y}%`,
            transition: { duration: segmentSpeed, ease: "linear" },
          });
        }
      }
    }

    const timer = setTimeout(() => {
      animateLoop();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [controls, trackPath, delay]);

  return (
    <motion.div
      className="absolute w-6 h-6 rounded-full shadow-lg z-10 border-2"
      style={{
        borderColor: color,
        backgroundColor: color,
        boxShadow: `0 0 20px ${color}`,
        left: `${trackPath[0].x}%`,
        top: `${trackPath[0].y}%`,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={controls}
    />
  );
}
