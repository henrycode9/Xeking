import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Square } from 'chess.js';
import { useChessStore } from '../store/useChessStore';
import { PieceMesh } from '../utils/chessModels';
import { PieceType, PlayerColor } from '../types';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

// Helper to convert board file/rank to 3D world coordinates
const squareToVector3 = (square: string): [number, number, number] => {
  const fileIdx = FILES.indexOf(square[0]);
  const rankIdx = parseInt(square[1]) - 1;
  const x = fileIdx - 3.5;
  const z = 3.5 - rankIdx;
  return [x, 0.05, z];
};

// Animated 3D Piece component with smooth parabolic move arc
const AnimatedPiece: React.FC<{
  type: PieceType;
  color: PlayerColor;
  square: Square;
  isSelected: boolean;
  isCheck: boolean;
  onClick: () => void;
}> = ({ type, color, square, isSelected, isCheck, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetPos = useMemo(() => squareToVector3(square), [square]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const current = meshRef.current.position;
    const liftY = isSelected ? 0.38 : 0.05;

    // Calculate horizontal move distance to generate a smooth parabolic hop arc
    const dx = targetPos[0] - current.x;
    const dz = targetPos[2] - current.z;
    const distSq = dx * dx + dz * dz;
    const hopArc = distSq > 0.01 ? Math.min(Math.sqrt(distSq) * 0.28, 0.6) : 0;

    current.x = THREE.MathUtils.lerp(current.x, targetPos[0], delta * 15);
    current.y = THREE.MathUtils.lerp(current.y, targetPos[1] + liftY + hopArc, delta * 15);
    current.z = THREE.MathUtils.lerp(current.z, targetPos[2], delta * 15);
  });

  return (
    <group
      ref={meshRef}
      position={[targetPos[0], targetPos[1], targetPos[2]]}
      rotation={[0, color === 'w' ? 0 : Math.PI, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <PieceMesh type={type} color={color} isSelected={isSelected} isCheck={isCheck} />
    </group>
  );
};

// Photorealistic Tile component
const Tile: React.FC<{
  square: Square;
  isDark: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}> = ({
  square,
  isDark,
  isSelected,
  isLegalMove,
  isLastMove,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const [x, , z] = squareToVector3(square);

  const tileColor = useMemo(() => {
    if (isSelected) return '#3b82f6'; // Royal Sapphire Selection
    if (isLastMove) return '#f59e0b'; // Amber Move Indicator
    if (isHovered && isLegalMove) return '#10b981'; // Emerald Hover Target

    return isDark ? '#334155' : '#f8fafc'; // Deep Dark Slate Walnut vs Polished Cream Ivory
  }, [isDark, isSelected, isLastMove, isHovered, isLegalMove]);

  return (
    <group position={[x, 0, z]}>
      {/* Base Tile Mesh with micro-bevel gap */}
      <mesh
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut();
        }}
      >
        <boxGeometry args={[0.96, 0.09, 0.96]} />
        <meshPhysicalMaterial
          color={tileColor}
          roughness={isDark ? 0.16 : 0.08}
          metalness={0.04}
          clearcoat={0.9}
          clearcoatRoughness={0.02}
          reflectivity={0.92}
        />
      </mesh>

      {/* Realistic Interactive 3D Legal Move Destination Disk */}
      {isLegalMove && (
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={isHovered ? 0.9 : 0.4}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

// 3D Scene Container
const SceneContent: React.FC = () => {
  const {
    chess,
    selectedSquare,
    hoveredSquare,
    legalMoves,
    lastMove,
    selectSquare,
    setHoveredSquare
  } = useChessStore();

  const board = chess.board();

  // Find king square in check
  const kingInCheckSquare = useMemo(() => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return `${FILES[c]}${RANKS[7 - r]}` as Square;
        }
      }
    }
    return null;
  }, [chess, board]);

  return (
    <>
      {/* Studio Lighting Setup for Photorealism */}
      <ambientLight intensity={1.15} />
      
      {/* Main Studio Key Light */}
      <directionalLight
        position={[9, 15, 7]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
        color="#ffffff"
      />

      {/* Soft Fill & Rim Lights */}
      <pointLight position={[-7, 7, -7]} intensity={0.9} color="#e2e8f0" />
      <pointLight position={[7, 5, 7]} intensity={0.9} color="#cbd5e1" />

      {/* Orbit Controls */}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={3.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0, 0]}
      />

      {/* Studio Floor Contact Shadows */}
      <ContactShadows
        position={[0, -0.07, 0]}
        opacity={0.4}
        scale={16}
        blur={1.8}
        far={4}
      />

      {/* Sleek Slate Studio Board Frame */}
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.1, 0.24, 9.1]} />
        <meshPhysicalMaterial
          color="#0f172a" // Sleek Slate Charcoal Studio Metal/Glass
          roughness={0.12}
          metalness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* Silver Chrome Edge Accent Trim */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[8.82, 0.03, 8.82]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Board Tiles */}
      {FILES.map((file, fIdx) =>
        RANKS.map((rank, rIdx) => {
          const square = `${file}${rank}` as Square;
          const isDark = (fIdx + rIdx) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isLegalMove = legalMoves.includes(square);
          const isLastMove = lastMove?.from === square || lastMove?.to === square;
          const isHovered = hoveredSquare === square;

          return (
            <Tile
              key={square}
              square={square}
              isDark={isDark}
              isSelected={isSelected}
              isLegalMove={isLegalMove}
              isLastMove={isLastMove}
              isHovered={isHovered}
              onClick={() => selectSquare(square)}
              onPointerOver={() => setHoveredSquare(square)}
              onPointerOut={() => setHoveredSquare(null)}
            />
          );
        })
      )}

      {/* 3D Chess Pieces */}
      {board.map((row, rIdx) =>
        row.map((piece, cIdx) => {
          if (!piece) return null;
          const square = `${FILES[cIdx]}${RANKS[7 - rIdx]}` as Square;
          const isSelected = selectedSquare === square;
          const isCheck = kingInCheckSquare === square;

          return (
            <AnimatedPiece
              key={`${square}-${piece.type}-${piece.color}`}
              type={piece.type as PieceType}
              color={piece.color as PlayerColor}
              square={square}
              isSelected={isSelected}
              isCheck={isCheck}
              onClick={() => selectSquare(square)}
            />
          );
        })
      )}
    </>
  );
};

export const ChessBoard3D: React.FC = () => {
  const { myColor } = useChessStore();

  // Balanced camera distance facing white or black side
  const cameraPos: [number, number, number] = myColor === 'b' ? [0, 7.2, -7.2] : [0, 7.2, 7.2];

  return (
    <div className="w-full h-full min-h-0 max-h-full relative rounded-2xl overflow-hidden shadow-lg pro-card border border-slate-200 transition-all duration-300">
      <Canvas
        shadows
        camera={{ position: cameraPos, fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};



