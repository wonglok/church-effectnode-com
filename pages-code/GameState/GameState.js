import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapControls, SkeletonUtils } from "three-stdlib";

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
});

export function GameControls() {
  //
  let { camera, gl } = useThree();
  let ctrls = useRef();
  useEffect(() => {
    let ctrl = (ctrls.current = new MapControls(camera, gl.domElement));
    camera.near = 0.1;
    camera.far = 100000;
    camera.updateProjectionMatrix();

    camera.position.x = 0;
    camera.position.y = 150;
    camera.position.z = 150;
    camera.rotation.y = 0;

    ctrl.enableRotate = false;
    ctrl.enableDamping = true;

    return () => {
      ctrl.dispose();
    };
  }, []);
  useFrame(() => {
    if (ctrls.current) {
      ctrls.current.update();
    }
  });
  return (
    <group>
      {/*  */}
      {/*  */}
    </group>
  );
}

export function YourAvatar({
  url = "https://d1a370nemizbjq.cloudfront.net/283ab29b-5ed6-4063-bf4c-a9739a7465bb.glb",
}) {
  let { scene } = useGLTF(url);
  //
  let cloned = useMemo(() => {
    let cloned = SkeletonUtils.clone(scene);

    return cloned;
  }, [scene]);

  useEffect(() => {
    //
  }, []);

  return (
    <group>
      <primitive object={cloned}></primitive>
    </group>
  );
}

export function Floor() {
  return (
    <group>
      <mesh rotation-x={Math.PI * -0.5}>
        <planeBufferGeometry args={[20000, 20000, 2, 2]}></planeBufferGeometry>
        <meshStandardMaterial
          metalness={0.9}
          roughness={0.1}
        ></meshStandardMaterial>
      </mesh>
      {/*  */}
      {/*  */}
    </group>
  );
}
