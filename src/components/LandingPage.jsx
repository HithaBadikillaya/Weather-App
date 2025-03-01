import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Preload, Center, Html, useProgress } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import SplitText from "./SplitText";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '1.2rem',
        textAlign: 'center',
        padding: '20px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '10px'
      }}>
        Loading {Math.round(progress)}%
      </div>
    </Html>
  );
}

const Model = ({ onLoaded }) => {
  const { scene } = useGLTF("/models/scene.gltf");
  const modelRef = useRef();

  // Handle model loaded callback
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.side = THREE.FrontSide;
        }
      });
      onLoaded();
    }
  }, [scene, onLoaded]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
      modelRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={scene}
        scale={[5, 5, 5]}
        position={[0, 0.5, 0]}
      />
    </Center>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [modelLoaded, setModelLoaded] = useState(false);
console.log(modelLoaded)
  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundImage: "url('/models/ppperspective.svg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>

      <div style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        color: "white",
        zIndex: 2,
      }}>
        <SplitText
          text="Weather Explorer"
          className="heading-text"
          delay={150}
          animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
          animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
          Discover real-time weather updates
        </p>
        <button
          onClick={() => navigate("/weather")}
          style={{
            padding: "15px 30px",
            background: "linear-gradient(90deg, rgb(179, 238, 203) 20%, rgb(142, 205, 226) 100%)",
            color: "black",
            fontSize: "1.2rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            boxShadow: "0px 0px 10px rgba(0, 191, 255, 0.7)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0px 0px 20px rgba(0, 191, 255, 1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 0px 10px rgba(0, 191, 255, 0.7)";
          }}
        >
          Try it out!
        </button>
      </div>

      <div style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "60vh",
      }}>
        <Canvas
          gl={{ alpha: true }}
          camera={{ position: [0, 3, 8], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={<Loader />}>
            <Model onLoaded={() => setModelLoaded(true)} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.5} />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default LandingPage;