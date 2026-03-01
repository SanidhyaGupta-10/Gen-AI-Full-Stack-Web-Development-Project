"use client";

import FloatingShape from "./FloatingShapes";


export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-br from-slate-950 via-black to-slate-900">
      
      <FloatingShape
        color="bg-purple-500"
        size="w-72 h-72"
        top="10%"
        left="15%"
        delay={0}
      />

      <FloatingShape
        color="bg-blue-500"
        size="w-96 h-96"
        top="40%"
        left="70%"
        delay={5}
      />

      <FloatingShape
        color="bg-pink-500"
        size="w-80 h-80"
        top="70%"
        left="30%"
        delay={2}
      />
    </div>
  );
}