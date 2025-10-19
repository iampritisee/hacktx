"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

function getRandomSpeed(type) {
  if (type === "turn") {
    return Math.random() * (1.5 - 0.7) + 2;
  } else {
    return Math.random() * (1.5 - 0.6) + .6;
  }
}

function getSegmentType(point) {
  return point.type === "turn" ? "turn" : "straight";
}

export default function RacerDot({ id, color, delay = 0, trackPath, onProgress, maxLaps }) {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);

  React.useEffect(() => {
    let isMounted = true;

    async function animateLoop() {
      let lap = 1;
      
      while (isMounted && lap <= maxLaps) {
        for (let i = 0; i < trackPath.length - 1; i++) {
          if (!isMounted || lap > maxLaps) break;
          
          const to = trackPath[i + 1];
          const segmentType = getSegmentType(to);
          const segmentSpeed = getRandomSpeed(segmentType);

          await controls.start({
            left: `${to.x}%`,
            top: `${to.y}%`,
            transition: { duration: segmentSpeed, ease: "easeIn" },
          });

          if (isMounted) {
            setCurrentIndex(i + 1);
            if (onProgress) {
              onProgress(id, i + 1, lap);
            }
          }
        }
        
        if (isMounted && lap < maxLaps) {
          lap++;
          setCurrentLap(lap);
        } else {
          break;
        }
      }
    }

    const timer = setTimeout(() => {
      if (isMounted) {
        animateLoop();
      }
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className="absolute z-10 w-6 h-6 rounded-full"
      style={{
        backgroundColor: color,
        left: `${trackPath[0].x}%`,
        top: `${trackPath[0].y}%`,
        translateX: "-50%",
        translateY: "-50%",
      }}

      animate={controls}
    />
  );
}