import { Stage, useFBX, useGLTF, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Head from "next/head";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimationMixer } from "three";
import { EnvMap } from "../pages-code/EnvMap/EnvMap";
// import { Game } from "../pages-code/Game/Game";
// import styles from "../styles/Home.module.css";

export const AVATAR_LOCAL_STORE_URL = "myavatarlink";
export default function Home() {
  let [avatarURL, setAvatarURL] = useState(null);

  useEffect(() => {
    let url = window.localStorage.getItem(AVATAR_LOCAL_STORE_URL);
    if (
      url &&
      url !== "false" &&
      typeof url === "string" &&
      url.indexOf("http") === 0
    ) {
      setAvatarURL(url);
    } else {
      setAvatarURL(false);
    }
  }, []);

  let onReady = (url) => {
    window.localStorage.setItem(AVATAR_LOCAL_STORE_URL, url);
    setAvatarURL(url);
  };

  return (
    <div className={"w-full h-full"}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {avatarURL && <AvatarReady url={avatarURL}></AvatarReady>}
      {avatarURL && (
        <div
          onClick={() => setAvatarURL(false)}
          className="absolute top-0 right-0 m-2 p-3 rounded-xl bg-yellow-400 text-white shadow-xl"
        >
          Customise Avatar
          <div className="absolute top-0 right-0 p-3 bg-yellow-400 rounded-full -mr-1 -mt-1 animate-ping"></div>
        </div>
      )}
      {avatarURL === false && <AvatarChooser onReady={onReady}></AvatarChooser>}
    </div>
  );
}
function AvatarReady({ url }) {
  return (
    <Canvas>
      <directionalLight
        intensity={0.2}
        position={[10, 10, 10]}
      ></directionalLight>

      <ambientLight intensity={0.2}></ambientLight>
      <EnvMap></EnvMap>

      <AvatarUnit url={url}></AvatarUnit>
    </Canvas>
  );
}

function AvatarUnit({ url }) {
  return (
    <Suspense
      fallback={
        <group scale={0.03} position-y={0} position-z={-0.1}>
          <Text
            color={"#EC2D2D"}
            fontSize={12}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign={"left"}
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
          >
            Loading YOU...
          </Text>
        </group>
      }
    >
      <group scale={0.04} position-y={2} position-z={-0.1}>
        <Text
          color={"#EC2D2D"}
          fontSize={12}
          maxWidth={200}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign={"left"}
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
          anchorX="center"
          anchorY="middle"
          onPointerDown={() => {
            window.location.assign("/game?avatar=" + encodeURIComponent(url));
          }}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "";
          }}
        >
          Start Game!
        </Text>
      </group>
      <AvatarUnitInternal url={url}></AvatarUnitInternal>
    </Suspense>
  );
}

function AvatarUnitInternal({ url }) {
  let orbit = useRef();
  let { scene, nodes } = useGLTF(url);
  let animix = useRef(new AnimationMixer(scene));

  let standingGreetingFBX = useFBX("/actions/standing-greeting.fbx");
  let wavingFBX = useFBX("/actions/waving-gesture.fbx");
  let bowFBX = useFBX("/actions/quick-formal-bow.fbx");
  let hipHopFBX = useFBX("/actions/hip-hop-dancing.fbx");

  useEffect(() => {
    scene.traverse((item) => {
      if (item) {
        item.frustumCulled = false;
      }
    });
    nodes.Head.getWorldPosition(camera.position);
    camera.position.z = 3;
  }, [scene]);

  let { camera } = useThree();

  useFrame(() => {
    nodes.Head.getWorldPosition(orbit.current.target);
    camera.lookAt(orbit.current.target);
  });

  useEffect(() => {
    let clips = [
      standingGreetingFBX.animations[0],
      wavingFBX.animations[0],
      bowFBX.animations[0],
      hipHopFBX.animations[0],
    ];
    let clip = clips[Math.floor(clips.length * Math.random())];
    let action = animix.current.clipAction(clip, scene);
    action.play();
  }, []);

  useFrame((st, dt) => {
    if (animix.current) {
      animix.current.update(dt);
    }
  });

  return (
    <group>
      <OrbitControls ref={orbit}></OrbitControls>
      <group>
        <primitive object={scene}></primitive>
      </group>
    </group>
  );
}

function AvatarChooser({
  onReady = (v) => {
    console.log(v);
  },
}) {
  const iframe = useRef();

  useEffect(() => {
    function receiveMessage(event) {
      setTimeout(() => {
        console.log(event.data);
        if (typeof event.data === "string") {
          onReady(event.data);
        }
        // https://d1a370nemizbjq.cloudfront.net/283ab29b-5ed6-4063-bf4c-a9739a7465bb.glb
      }, 0);
    }

    window.addEventListener("message", receiveMessage, false);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <iframe
      ref={iframe}
      className="w-full h-full"
      src={"https://effectnode.readyplayer.me/"}
      allow={"camera *; microphone *"}
    ></iframe>
  );
}
