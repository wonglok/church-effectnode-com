import { Canvas } from "@react-three/fiber";
import { EnvMap } from "../EnvMap/EnvMap";
import { Floor, GameControls, YourAvatar } from "../GameState/GameState";
import router from "next/router";
import { useEffect } from "react";
import { AVATAR_LOCAL_STORE_URL } from "../../pages";
export function Game() {
  const dpr = 1;

  return (
    <Canvas dpr={dpr} antialias={true} camera={{ position: [0, 150, 150] }}>
      <GameContent></GameContent>
    </Canvas>
  );
}

function GameContent() {
  let [url, setURL] = useState(null);

  useEffect(() => {
    if (url === null) {
      let str = window.localStorage(AVATAR_LOCAL_STORE_URL);
      // window.location = "/";
      if (typeof str === "string" && str.indexOf("http") === 0) {
        setURL(str);
      } else {
        window.location = "/";
      }
    }
  });

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

      <YourAvatar url={url}></YourAvatar>
    </group>
  );
}
