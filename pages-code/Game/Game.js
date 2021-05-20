import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EnvMap } from "../EnvMap/EnvMap";
import { Floor, GameControls, YourAvatar } from "../GameState/GameState";

export function Game() {
  const dpr = 1;

  return (
    <Canvas dpr={dpr} antialias={true} camera={{ position: [0, 150, 150] }}>
      <GameContent></GameContent>
    </Canvas>
  );
}

function GameContent() {
  return (
    <group>
      {/*  */}
      {/*  */}
      <Floor></Floor>
      <directionalLight
        intensity={0.5}
        position={[10, 10, 10]}
      ></directionalLight>
      <ambientLight intensity={0.5}></ambientLight>
      <EnvMap></EnvMap>
      <GameControls></GameControls>

      <YourAvatar></YourAvatar>
    </group>
  );
}
