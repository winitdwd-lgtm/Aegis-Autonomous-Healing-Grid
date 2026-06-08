import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { ShieldAlert, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import io from 'socket.io-client'; // <-- The real-time radio!

// ==========================================
// 1. THE 3D SERVER CORE COMPONENT
// ==========================================
const ServerCore = ({ systemState }) => {
  const meshRef = useRef();

  // Dynamic colors and distortion based on system health
  const isCrashed = systemState === 'CRASHED';
  const isHealing = systemState === 'HEALING';

  const coreColor = isCrashed ? '#ff003c' : isHealing ? '#b829ea' : '#00ffff';
  const distortSpeed = isCrashed ? 10 : isHealing ? 5 : 2;
  const distortAmount = isCrashed ? 0.8 : 0.3;

  useFrame((state, delta) => {
    // Spin the core!
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (isCrashed ? 0.1 : 0.5);
      meshRef.current.rotation.y += delta * (isCrashed ? 0.1 : 0.6);
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color={coreColor}
        emissive={coreColor}
        emissiveIntensity={isCrashed ? 0.8 : 0.5}
        wireframe={true}
        distort={distortAmount}
        speed={distortSpeed}
      />
    </Sphere>
  );
};

// ==========================================
// 2. THE MAIN DASHBOARD
// ==========================================
export default function AegisDashboard() {
  const [systemState, setSystemState] = useState('HEALTHY'); // HEALTHY, CRASHED, HEALING
  const [logs, setLogs] = useState(["> System Initialized. Listening for Universal Sidecars..."]);
  const logsEndRef = useRef(null);

  // Auto-scroll the terminal to the bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // THE REAL LIVE CONNECTION
  useEffect(() => {
    // Tune the antenna to the Central Brain API
    const socket = io('http://localhost:8081');

    // Whenever the Brain broadcasts an event, update the 3D UI!
    socket.on('system_event', (data) => {
      setSystemState(data.state);
      setLogs(prev => [...prev, " ", data.log]);
    });

    // Clean up the connection when the component unmounts
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

      {/* THE 3D BACKGROUND CANVAS */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <ServerCore systemState={systemState} />
          <OrbitControls enableZoom={false} autoRotate={systemState === 'HEALTHY'} autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* THE 2D CYBERPUNK UI OVERLAY */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', padding: '30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

          {/* Logo & Title */}
          <div className="cyber-panel" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ShieldAlert size={32} color={systemState === 'CRASHED' ? '#ff003c' : '#00ffff'} />
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px', color: '#fff' }}>PROJECT AEGIS</h1>
              <span style={{ fontSize: '11px', color: '#00ffff', letterSpacing: '4px' }}>AUTONOMOUS SELF-HEALING ARCHITECTURE</span>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="cyber-panel" style={{ padding: '20px', width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#64748b', fontSize: '12px' }}>
              <span>SYSTEM STATUS</span>
              <span className={systemState === 'CRASHED' ? 'text-red' : systemState === 'HEALING' ? 'text-purple' : 'text-cyan'} style={{ fontWeight: 'bold' }}>
                {systemState}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <Cpu size={18} color="#00ffff" />
              <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div animate={{ width: systemState === 'CRASHED' ? '100%' : '35%' }} style={{ height: '100%', background: systemState === 'CRASHED' ? '#ff003c' : '#00ffff' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Database size={18} color="#b829ea" />
              <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: '#b829ea' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: The Live Terminal */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="cyber-panel terminal-text" style={{ width: '800px', height: '250px', padding: '20px', overflowY: 'auto', pointerEvents: 'auto' }}>
            <div style={{ color: '#64748b', marginBottom: '10px', fontSize: '11px', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              LIVE WATCHMAN TELEMETRY
            </div>

            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                dangerouslySetInnerHTML={{ __html: log }}
                style={{ marginBottom: '4px' }}
              />
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* The Architect's Signature */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '30px',
          color: '#64748b',
          fontSize: '10px',
          letterSpacing: '3px',
          fontFamily: "'Fira Code', 'Consolas', monospace",
          pointerEvents: 'none',
          textAlign: 'right'
        }}>
          ENGINEERED BY<br />
          <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '12px' }}>VINEET M DHARWAD</span>
        </div>

      </div>
    </div>
  );
}