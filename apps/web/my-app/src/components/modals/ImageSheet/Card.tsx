"use client";
import { Sheet } from "@silk-hq/components";
import "./Card.css";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
   presentTrigger: React.ReactNode;
   sheetContent: React.ReactNode;
}

const Card = ({ presentTrigger, sheetContent, ...restProps }: Props) => {
   return (
      <Sheet.Root license="commercial" {...restProps}>
         {presentTrigger}
         <Sheet.Portal>
            <Sheet.View
               className="Card-view"
               contentPlacement="center"
               tracks="top"
               enteringAnimationSettings={{
                  easing: "spring",
                  stiffness: 260,
                  damping: 20,
                  mass: 1,
               }}
               nativeEdgeSwipePrevention={true}
            >
               <Sheet.Backdrop
                  className="Card-backdrop"
                  travelAnimation={{
                     opacity: ({ progress }) => Math.min(0.4 * progress, 0.4),
                  }}
                  themeColorDimming="auto"
               />
               <Sheet.Content
                  className="Card-content"
                  travelAnimation={{
                     scale: [0.8, 1],
                  }}
               >
                  {sheetContent}
               </Sheet.Content>
            </Sheet.View>
         </Sheet.Portal>
      </Sheet.Root>
   );
};

export { Card };
