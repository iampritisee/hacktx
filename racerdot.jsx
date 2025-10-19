"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

// Base speed in percent per second (adjust to your liking)
const BASE_SPEED = 5;

// Random speed factor range (e.g. between 0.7x and 1.3x of BASE_SPEED)
const MIN_SPEED_FACTOR = 0.7;
const MAX_SPEED_FACTOR = 1.3;

function getDistance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getRandomSpeedFactor() {
  return Math.random() * (MAX_SPEED_FACTOR - MIN_SPEED_FACTOR) + MIN_SPEED_FACTOR;
}

export default function RacerDot({ id, color, delay = 0, trackPath, onProgress, maxLaps }) {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLap, setCurrentLap] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function animateLoop() {
      let lap = 1;

      while (isMounted && lap <= maxLaps) {
        for (let i = 0; i < trackPath.length - 1; i++) {
          if (!isMounted) break;

          const from = trackPath[i];
          const to = trackPath[i + 1];
          const distance = getDistance(from, to);
          const speedFactor = getRandomSpeedFactor();
          const duration = distance / (BASE_SPEED * speedFactor);

          await controls.start({
            left: `${to.x}%`,
            top: `${to.y}%`,
            transition: {
              duration,
              ease: "linear",
            },
          });

          if (isMounted) {
            setCurrentIndex(i + 1);
            onProgress?.(id, i + 1, lap);
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
