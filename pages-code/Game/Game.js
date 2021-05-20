import { Canvas } from "@react-three/fiber";
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
      <directionalLight position={[10, 10, 10]}></directionalLight>
      <ambientLight></ambientLight>
      <EnvMap></EnvMap>
      <GameControls></GameControls>
      <YourAvatar></YourAvatar>
    </group>
  );
}
