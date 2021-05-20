import { Text, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MapControls, OrbitControls, SkeletonUtils } from "three-stdlib";
import { usePinch, useWheel } from "react-use-gesture";
import {
  AnimationMixer,
  Camera,
  Euler,
  Object3D,
  SphereBufferGeometry,
  Vector3,
} from "three";

export const getID = function () {
  return (
    "_" +
    Math.random().toString(36).substr(2, 9) +
    Math.random().toString(36).substr(2, 9)
  );
};

export const onEvent = function (ev, fnc) {
  useEffect(() => {
    window.addEventListener(ev, fnc);
    return () => {
      window.removeEventListener(ev, fnc);
    };
  }, []);
};

export const makeSimpleShallowStore = (myObject = {}) => {
  let ___NameSpaceID = getID();
  let Utils = {
    exportJSON: () => {
      return JSON.parse(JSON.stringify(myObject));
    },
    getNameSpcaeID: () => {
      return ___NameSpaceID;
    },
    onEventChangeKey: (key, func) => {
      let evName = `${___NameSpaceID}`;
      let hh = () => {
        func(myObject[key]);
      };

      window.addEventListener(`${evName}-${key}`, hh);
      return () => {
        window.removeEventListener(`${evName}-${key}`, hh);
      };
    },
    onChangeKey: (key, func) => {
      useEffect(() => {
        let evName = `${___NameSpaceID}`;
        let hh = () => {
          func(myObject[key]);
        };

        window.addEventListener(`${evName}-${key}`, hh);
        return () => {
          window.removeEventListener(`${evName}-${key}`, hh);
        };
      }, []);
    },

    makeKeyReactive: (key) => {
      let [, setSt] = useState(0);
      useEffect(() => {
        let evName = `${___NameSpaceID}`;

        let hh = () => {
          setSt((s) => {
            return s + 1;
          });
        };

        window.addEventListener(`${evName}-${key}`, hh);
        return () => {
          window.removeEventListener(`${evName}-${key}`, hh);
        };
      }, []);
    },
    notifyKeyChange: (key) => {
      window.dispatchEvent(
        new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
      );
    },
  };

  let setupArray = (array, key, Utils) => {
    array.getItemByID =
      array.getItemByID ||
      ((_id) => {
        let result = array.find((a) => a._id === _id);
        return result;
      });

    array.getItemIndexByID =
      array.getItemIndexByID ||
      ((_id) => {
        let result = array.findIndex((a) => a._id === _id);
        return result;
      });

    array.addItem =
      array.addItem ||
      ((item) => {
        let api = makeSimpleShallowStore(item);
        array.push(api);

        let ns = Utils.getNameSpcaeID();
        window.dispatchEvent(new CustomEvent(`${ns}-${key}`, { detail: {} }));

        return api;
      });

    array.removeItem =
      array.removeItem ||
      ((item) => {
        //
        let idx = array.findIndex((a) => a._id === item._id);

        if (idx !== -1) {
          array.splice(idx, 1);
          let ns = Utils.getNameSpcaeID();
          window.dispatchEvent(new CustomEvent(`${ns}-${key}`, { detail: {} }));
        } else {
          console.log(`item not found: ${item._id}`);
        }
      });
  };

  Object.keys(myObject).forEach((kn) => {
    let val = myObject[kn];
    if (val instanceof Array) {
      setupArray(val, kn, Utils);
    }
  });

  let proxy = new Proxy(myObject, {
    get: (o, k) => {
      //
      if (Utils[k]) {
        return Utils[k];
      }

      return o[k];
    },
    set: (o, key, val) => {
      if (val instanceof Array) {
        setupArray(val, key, Utils);
      }

      o[key] = val;

      window.dispatchEvent(
        new CustomEvent(`${___NameSpaceID}-${key}`, { detail: {} })
      );

      return true;
    },
  });

  return proxy;
};

export const Hand = makeSimpleShallowStore({
  moved: 0,
  isDown: false,
  goingTo: new Vector3(),
  camAt: new Vector3(),
  avatarAt: new Vector3(),
  avatarHead: new Vector3(),
  avatarRot: new Vector3(),
  avatarLoading: true,
  avatarMode: "standing",
});

export function GameControls() {
  const minLimit = 100;
  const maxLimit = 500;
  const zoom = useRef(new Vector3(0, 400, 400));

  let { camera, gl } = useThree();
  let ctrls = useRef();

  useWheel(
    (state) => {
      let deltaY = state.vxvy[1] * 3;

      if (zoom.current.z > minLimit) {
        zoom.current.y += deltaY;
        zoom.current.z += deltaY;
      } else {
        zoom.current.y = minLimit;
        zoom.current.z = minLimit;
      }

      if (zoom.current.z < maxLimit) {
        zoom.current.y += deltaY;
        zoom.current.z += deltaY;
      } else {
        zoom.current.y = maxLimit;
        zoom.current.z = maxLimit;
      }

      camera.needsUpdate = true;
    },
    { domTarget: gl.domElement, eventOptions: { passive: false } }
  );

  usePinch(
    (state) => {
      let deltaY = state.vdva[0] * -3;

      if (zoom.current.z > minLimit) {
        zoom.current.y += deltaY;
        zoom.current.z += deltaY;
      } else {
        zoom.current.y = minLimit;
        zoom.current.z = minLimit;
      }

      if (zoom.current.z < maxLimit) {
        zoom.current.y += deltaY;
        zoom.current.z += deltaY;
      } else {
        zoom.current.y = maxLimit;
        zoom.current.z = maxLimit;
      }

      camera.needsUpdate = true;
    },
    { domTarget: gl.domElement, eventOptions: { passive: false } }
  );

  useEffect(() => {
    let ctrl = (ctrls.current = new MapControls(camera, gl.domElement));
    camera.near = 0.1;
    camera.far = 100000;
    camera.updateProjectionMatrix();

    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 150;
    camera.rotation.y = 0;

    ctrl.minDistance = minLimit;
    ctrl.maxDistance = maxLimit;

    ctrl.screenSpacePanning = false;
    ctrl.enablePan = false;
    ctrl.enableZoom = true;
    ctrl.enableDamping = true;
    ctrl.enableRotate = false;

    return () => {
      ctrl.dispose();
      camera.lookAt(Hand.avatarHead);
    };
  }, []);

  useFrame(() => {
    if (ctrls.current) {
      ctrls.current.update();

      ctrls.current.target.copy(Hand.avatarHead);

      ctrls.current.object.position.x = Hand.avatarAt.x;
      ctrls.current.object.position.y =
        ctrls.current.target.y + zoom.current.y - 100;
      ctrls.current.object.position.z = ctrls.current.target.z + zoom.current.z;
    }
  });
  return <group></group>;
}

export function YourAvatar() {
  return (
    <Suspense
      fallback={
        <group scale={5} position-y={11} rotation-x={Math.PI * -0.1}>
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
      <YourAvatarInside></YourAvatarInside>
    </Suspense>
  );
}

export function YourAvatarInside({
  url = "https://d1a370nemizbjq.cloudfront.net/283ab29b-5ed6-4063-bf4c-a9739a7465bb.glb",
}) {
  useEffect(() => {
    Hand.avatarLoading = false;
  }, []);
  let { scene } = useGLTF(url);
  let myself = useRef();
  let actions = useRef({});

  actions.current.running = useFBX("/actions/running.fbx");
  actions.current.standingTexting = useFBX("/actions/standing-texting.fbx");
  actions.current.standingTime = useFBX("/actions/standing-time.fbx");
  actions.current.standing = useFBX("/actions/standing.fbx");

  let object = useMemo(() => {
    let cloned = scene; // SkeletonUtils.clone(scene);

    cloned.scale.set(100, 100, 100);

    cloned.traverse((item) => {
      if (item.material) {
        item.frustumCulled = false;
      }
    });

    return cloned;
  }, []);

  // let dir = new Vector3();
  useFrame(() => {
    if (myself.current && Hand.avatarMode === "running") {
      myself.current.lookAt(Hand.goingTo);
      myself.current.position.copy(Hand.avatarAt);
      Hand.avatarRot.copy(myself.current.rotation);
    }

    let head = object.getObjectByName("Head");
    if (head) {
      head.getWorldPosition(Hand.avatarHead);
    }

    if (
      myself.current &&
      Hand.avatarMode === "running" &&
      myself.current.position.distanceTo(Hand.goingTo) < 10
    ) {
      Hand.avatarMode = "standing";
    }
  });

  return (
    <group>
      <AnimationCtrl myself={myself} actions={actions}></AnimationCtrl>
      <Cursor></Cursor>
      <group ref={myself} name={"myself"}>
        <primitive object={object}></primitive>
      </group>
    </group>
  );
}

function Cursor({}) {
  Hand.makeKeyReactive("avatarMode");
  let destinationRef = useRef();

  useFrame(() => {
    if (destinationRef.current) {
      destinationRef.current.position.copy(Hand.goingTo);
      destinationRef.current.rotation.y += 0.11;

      destinationRef.current.position.y +=
        Math.sin(destinationRef.current.rotation.y) * 35;
    }
  });

  return (
    Hand.avatarMode === "running" && (
      <group ref={destinationRef}>
        <mesh scale={[4, 8, 4]} position-y={10 * 10 * 0.5}>
          <meshStandardMaterial
            metalness={1}
            roughnes={0.1}
            color={"white"}
          ></meshStandardMaterial>
          <sphereBufferGeometry args={[10, 5, 1]}></sphereBufferGeometry>
        </mesh>
      </group>
    )
  );
}

function AnimationCtrl({ myself, actions }) {
  Hand.makeKeyReactive("avatarMode");
  let animix = useRef(new AnimationMixer(myself.current));
  let lastAction = useRef();
  useEffect(() => {
    let mixer = animix.current;
    if (lastAction.current) {
      lastAction.current.fadeOut(0.2);
    }

    if (Hand.avatarMode === "running") {
      //
      let clip = actions.current.running.animations[0];
      let action = mixer.clipAction(clip, myself.current);
      action.reset();
      action.fadeIn(0.2);
      action.play();
      lastAction.current = action;
    }
    if (Hand.avatarMode === "standing") {
      //300

      let clips = [
        actions.current.standingTexting.animations[0],
        actions.current.standing.animations[0],
        actions.current.standingTime.animations[0],
      ];
      let clip = clips[Math.floor(clips.length * Math.random())];
      let action = mixer.clipAction(clip, myself.current);
      action.reset();
      action.fadeIn(0.2);
      action.play();
      lastAction.current = action;
    }
    return () => {
      // mixer.stopAllAction();
    };
  }, [Hand.avatarMode]);

  useFrame((st, dt) => {
    if (animix.current) {
      animix.current.update(dt);
    }
  });

  return <group></group>;
}

export function Floor() {
  let o3 = new Object3D();

  let dir = new Vector3();

  let floor = useRef();

  let { raycaster, camera, mouse } = useThree();
  useFrame(() => {
    if (Hand.avatarMode === "running" && !Hand.avatarLoading) {
      o3.position.copy(Hand.avatarAt);
      o3.lookAt(Hand.goingTo);

      o3.getWorldDirection(dir);
      dir.normalize().multiplyScalar(10);
      Hand.avatarAt.add(dir);

      if (Hand.isDown && floor.current) {
        raycaster.setFromCamera(mouse, camera);
        let res = raycaster.intersectObject(floor.current);
        if (res && res[0]) {
          // console.log(res);
          Hand.goingTo.copy(res[0].point);
        }
      }
    }
  });

  return (
    <group>
      <gridHelper args={[20000, 100, "red", "red"]}></gridHelper>
      <mesh
        ref={floor}
        onPointerDown={(ev) => {
          if (Hand.avatarLoading) {
            return;
          }
          Hand.isDown = true;
          Hand.goingTo.copy(ev.point);
        }}
        onPointerUp={() => {
          if (Hand.avatarLoading) {
            return;
          }
          Hand.isDown = false;
          Hand.avatarMode = "running";
        }}
        onPointerMove={(ev) => {
          if (Hand.avatarLoading) {
            return;
          }
          if (Hand.isDown) {
            Hand.goingTo.copy(ev.point);
            Hand.avatarMode = "running";
          }
        }}
        rotation-x={Math.PI * -0.5}
      >
        <planeBufferGeometry args={[20000, 20000, 2, 2]}></planeBufferGeometry>
        <shaderMaterial
          fragmentShader={`
        void main(void) {
          discard;
        }`}
        ></shaderMaterial>
      </mesh>
      {/*  */}
      {/*  */}
    </group>
  );
}
