import React from "react";

interface DynamicShadowProps {
  sunPos: { x: number; y: number };
  shape: 'rect' | 'circle';
  height: number; // The visual height of the object in pixels
  children: React.ReactNode;
}

const DynamicShadow: React.FC<DynamicShadowProps> = ({ sunPos, shape, height, children }) => {
  // 1. Calculate vertical shift: 0 at top, 'height' at horizon
  const shadowShiftY = (sunPos.y / 100) * height;
  
  // 2. Base dimensions for a 1m x 1m footprint
  const shadowWidth = 16;
  const shadowHeight = shape === 'rect' ? 16 : 8;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* The Shadow Layer (The "Footprint") */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: `${shadowWidth}px`,
          height: `${shadowHeight}px`,
          background: 'rgba(0, 0, 0, 0.4)', // Transparent Black Mask
          borderRadius: shape === 'circle' ? '50%' : '0',
          filter: 'blur(1.5px)',
          // Translate the footprint DOWN based on height and sun Y
          transform: `translateX(-50%) translateY(${shadowShiftY}px)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      {/* The Actual Object */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default DynamicShadow;
