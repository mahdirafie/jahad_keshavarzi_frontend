import { useLottie } from "lottie-react";
import * as VidaBrainAnimation from "../assets/animations/vida_brain.json";
import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";

const VidaBrainAnim = () => {
  const VidaBrainRef = useRef(null);
  const IsVidaBrainInView = useInView(VidaBrainRef, { amount: 0.1 });

  const options = {
    animationData: VidaBrainAnimation,
    loop: true,
  };

  const { View, play, pause } = useLottie(options);

  useEffect(() => {
    if (IsVidaBrainInView) {
      play();
    } else {
      pause();
    }
  }, [IsVidaBrainInView, play, pause]);

  return (
    <div ref={VidaBrainRef}>
      {View}
    </div>
  );
};

export default VidaBrainAnim;

