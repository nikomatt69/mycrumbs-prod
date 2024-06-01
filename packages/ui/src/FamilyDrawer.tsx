import { DialogPanel, DialogTitle } from "@headlessui/react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, ReactNode, FC } from "react";
import { Button } from "./Button";
import { DynamicIsland } from "./DynamicIsland";
import Listen from '@lensshare/web/src/components/Listen/index'
import { ButtonMoving } from "./MovingBorder";


export const FamilyDrawer = () => {
  const [showExtraContent, setShowExtraContent] = useState(false);
  const [height, setHeight] = useState(0);
  const elementRef = useRef(null);
 
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.target.getBoundingClientRect();
 
        setHeight(rect.height);
      }
    });
 
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
 
    return () => observer.disconnect();
  }, []);
 
  return (
    <div className="wrapper">
      <motion.div animate={{ height }} className="element">
        <div ref={elementRef} className="inner">
          <DialogTitle title="Player"/>

          <DialogPanel>
            
            <DynamicIsland />
          </DialogPanel> 
            
     
          {showExtraContent ? (
            <DialogPanel><Listen/></DialogPanel>
          ) : null}
        </div>
        <ButtonMoving className="button" onClick={() => setShowExtraContent((b) => !b)}>
        Show More
      </ButtonMoving>
      </motion.div>
    </div>
  );
}
