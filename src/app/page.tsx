import Image from "next/image";
import ThreeScene from "@/app/components/ThreeScene";
import Leaderboard from "@/app/components/leaderboard";
import RaceTrack from "@/app/components/simulation";

// snells law 
// n1 sin(t1) = n2 sin(t2)

/**
 *  here f is the surface function
 *  const height = f(distanceFromSide);
 *  const delta = 0.001; // Small value to approximate derivative
 *  const y1 = f(distanceFromSide - delta);
 *  const y2 = f(distanceFromSide + delta);
 *  const derivative = (y2 - y1) / (2 * delta);
 *  const normal = { x: -derivative, y: 1 }; // Derivative, rotated by -90 degrees
 */

export default function Home() {

  return (
    <>
    {/*<ThreeScene />*/}
    {/*<Image 
      src={leaf}
      alt="a picture of a leaf with droplets over it"
      />*/}
    <RaceTrack />
    </>
  );
}