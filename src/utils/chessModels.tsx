import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PlayerColor, PieceType } from '../types';

interface PieceMeshProps {
  type: PieceType;
  color: PlayerColor;
  isSelected?: boolean;
  isCheck?: boolean;
}

export const PieceMesh: React.FC<PieceMeshProps> = ({ type, color, isSelected, isCheck }) => {
  // Photorealistic Staunton Piece Silhouettes (Smooth 64-segment Lathe Curve Profiles)
  const geometry = useMemo(() => {
    const points: THREE.Vector2[] = [];

    switch (type) {
      case 'p': { // Pawn
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.44, 0.04));
        points.push(new THREE.Vector2(0.40, 0.10));
        points.push(new THREE.Vector2(0.36, 0.18));
        points.push(new THREE.Vector2(0.22, 0.65));
        points.push(new THREE.Vector2(0.28, 0.72));
        points.push(new THREE.Vector2(0.22, 0.78));
        points.push(new THREE.Vector2(0.32, 0.98));
        points.push(new THREE.Vector2(0.28, 1.15));
        points.push(new THREE.Vector2(0, 1.25));
        return new THREE.LatheGeometry(points, 64);
      }
      case 'r': { // Rook
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.48, 0.04));
        points.push(new THREE.Vector2(0.44, 0.12));
        points.push(new THREE.Vector2(0.40, 0.20));
        points.push(new THREE.Vector2(0.30, 0.92));
        points.push(new THREE.Vector2(0.42, 1.05));
        points.push(new THREE.Vector2(0.42, 1.38));
        points.push(new THREE.Vector2(0, 1.38));
        return new THREE.LatheGeometry(points, 64);
      }
      case 'b': { // Bishop
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.47, 0.04));
        points.push(new THREE.Vector2(0.42, 0.12));
        points.push(new THREE.Vector2(0.38, 0.20));
        points.push(new THREE.Vector2(0.22, 0.92));
        points.push(new THREE.Vector2(0.32, 1.10));
        points.push(new THREE.Vector2(0.26, 1.52));
        points.push(new THREE.Vector2(0.12, 1.68));
        points.push(new THREE.Vector2(0, 1.74));
        return new THREE.LatheGeometry(points, 64);
      }
      case 'q': { // Queen
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.50, 0.04));
        points.push(new THREE.Vector2(0.44, 0.14));
        points.push(new THREE.Vector2(0.40, 0.22));
        points.push(new THREE.Vector2(0.25, 1.22));
        points.push(new THREE.Vector2(0.38, 1.45));
        points.push(new THREE.Vector2(0.40, 1.82));
        points.push(new THREE.Vector2(0.18, 1.95));
        points.push(new THREE.Vector2(0, 2.02));
        return new THREE.LatheGeometry(points, 64);
      }
      case 'k': { // King
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.52, 0.04));
        points.push(new THREE.Vector2(0.46, 0.14));
        points.push(new THREE.Vector2(0.42, 0.24));
        points.push(new THREE.Vector2(0.27, 1.32));
        points.push(new THREE.Vector2(0.42, 1.58));
        points.push(new THREE.Vector2(0.44, 2.02));
        points.push(new THREE.Vector2(0.20, 2.18));
        points.push(new THREE.Vector2(0, 2.24));
        return new THREE.LatheGeometry(points, 64);
      }
      case 'n': { // Knight Base
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.47, 0.04));
        points.push(new THREE.Vector2(0.42, 0.14));
        points.push(new THREE.Vector2(0.38, 0.24));
        points.push(new THREE.Vector2(0.28, 0.52));
        points.push(new THREE.Vector2(0, 0.58));
        return new THREE.LatheGeometry(points, 64);
      }
      default:
        return new THREE.CylinderGeometry(0.3, 0.4, 1, 64);
    }
  }, [type]);

  // Photorealistic PBR Materials: Hand-polished Ivory Marble vs Carved Polished Ebony Wood
  const materialProps = useMemo(() => {
    if (color === 'w') {
      return {
        color: new THREE.Color('#faf9f6'), // Polished Hand-Carved Ivory Marble
        roughness: 0.10,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.95,
      };
    } else {
      return {
        color: new THREE.Color('#1c1917'), // Carved Polished Ebony Wood
        roughness: 0.16,
        metalness: 0.15,
        clearcoat: 0.85,
        clearcoatRoughness: 0.04,
        reflectivity: 0.90,
      };
    }
  }, [color]);

  return (
    <group>
      {/* Base Body Mesh */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          {...materialProps}
          emissive={
            isCheck 
              ? new THREE.Color('#ef4444') 
              : isSelected 
              ? new THREE.Color('#3b82f6') 
              : new THREE.Color('#000000')
          }
          emissiveIntensity={isCheck ? 0.9 : isSelected ? 0.6 : 0}
        />
      </mesh>

      {/* Rook Castle Crenellations (4 Battlement Cuts) */}
      {type === 'r' && (
        <group position={[0, 1.40, 0]}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <mesh
              key={i}
              castShadow
              position={[
                0.32 * Math.cos(angle + Math.PI / 4),
                0.08,
                0.32 * Math.sin(angle + Math.PI / 4),
              ]}
            >
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshPhysicalMaterial {...materialProps} />
            </mesh>
          ))}
        </group>
      )}

      {/* Bishop Top Spherical Finial */}
      {type === 'b' && (
        <mesh position={[0, 1.82, 0]} castShadow>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      )}

      {/* Queen Crown Beads (8 Spheres on Rim) */}
      {type === 'q' && (
        <group position={[0, 1.94, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            return (
              <mesh
                key={i}
                castShadow
                position={[0.34 * Math.cos(angle), 0.06, 0.34 * Math.sin(angle)]}
              >
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshPhysicalMaterial {...materialProps} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Royal Crown Cross for King */}
      {type === 'k' && (
        <group position={[0, 2.38, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.34, 0.08]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[0.28, 0.08, 0.08]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
      )}

      {/* Photorealistic Knight Horse Head Model */}
      {type === 'n' && (
        <group position={[0, 0.85, 0.08]} rotation={[0.18, 0, 0]}>
          {/* Main Skull */}
          <mesh castShadow position={[0, 0.38, 0.1]}>
            <boxGeometry args={[0.38, 0.60, 0.54]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Muzzle Snout */}
          <mesh castShadow position={[0, 0.18, 0.38]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[0.32, 0.34, 0.44]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Ears */}
          <mesh castShadow position={[-0.12, 0.70, -0.05]} rotation={[0.2, -0.2, 0]}>
            <coneGeometry args={[0.07, 0.22, 16]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh castShadow position={[0.12, 0.70, -0.05]} rotation={[0.2, 0.2, 0]}>
            <coneGeometry args={[0.07, 0.22, 16]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          {/* Mane Ridge */}
          <mesh castShadow position={[0, 0.45, -0.2]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.12, 0.52, 0.22]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
      )}
    </group>
  );
};




