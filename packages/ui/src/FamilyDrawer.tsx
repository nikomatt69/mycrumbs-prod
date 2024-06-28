import {  Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, ReactNode, FC } from "react";
import { Button } from "./Button";
import Lobby from '@lensshare/web/src/components/Meet/index'
import { DynamicIsland } from "./DynamicIsland";
import Listen from '@lensshare/web/src/components/Listen/index'
import { ButtonMoving } from "./MovingBorder";
import { Card } from "./Card";


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
    <div className="wrapper border-0">
      <motion.div animate={{ height }} className="element">
        <div ref={elementRef} className="inner">
        <Card className="items-center border-0  justify-center ">
          {!showExtraContent ?

        <Button className="button text-xs items-center justify-center  " onClick={() => setShowExtraContent((b) => !b)}>
        Show More
      </Button> : null}
     
          {showExtraContent ? (
            <DynamicIsland />
          ) : null}
         </Card>
        </div>
      
      </motion.div>
    </div>
  );
}
