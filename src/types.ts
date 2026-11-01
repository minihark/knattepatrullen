export type VehicleType = 'fire' | 'tractor' | 'rocket' | 'rescue';
export type TimeOfDay = 'day' | 'night';

export interface VehicleTraits {
  maxSpeed: number;
  accel: number;
  gravity: number;
  jumpPower: number;
  wheelScale: number;
  special: 'water' | 'trailer' | 'hover' | 'nitro';
  specialNameSv: string;
  specialNameEn: string;
  engineHumPitch: number;
}

export interface CarUpgrades {
  engineLevel: number;      // 0, 1, 2, 3 (+speed, turbo flames)
  suspensionLevel: number;  // 0, 1, 2, 3 (+jump, higher bounce)
  tireLevel: number;        // 0, 1, 2, 3 (+grip, bigger wheels, chrome rims)
  paintId: 'default' | 'gold' | 'neon' | 'fire';
}

export interface VehicleConfig {
  id: VehicleType;
  nameSv: string;
  nameEn: string;
  emoji: string;
  color: string;
  wheelColor: string;
  roofLight: boolean;
  honkSound: 'horn' | 'quack' | 'siren' | 'boing' | 'cat' | 'dog';
  hornEmoji: string;
  descriptionSv: string;
  traits: VehicleTraits;
}

export type LevelId = 'apples' | 'shapes' | 'letters' | 'math' | 'colors' | 'beach';

export interface LevelConfig {
  id: LevelId;
  titleSv: string;
  titleEn: string;
  subtitleSv: string;
  emoji: string;
  learningFocusSv: string;
  learningFocusEn: string;
  theme: {
    skyTop: string;
    skyBottom: string;
    grassFill: string;
    grassOutline: string;
    groundFill: string;
  };
  goalCount: number;
  itemType: 'apple' | 'shapeKey' | 'colorOrb' | 'star' | 'letter' | 'number';
  missionDescriptionSv: string;
  missionDescriptionEn: string;
  friendAnimal: 'horse' | 'dragon' | 'bear' | 'turtle' | 'monkey' | 'beaver';
}

export interface CollectibleItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  type: 'apple' | 'shapeKey' | 'colorOrb' | 'star' | 'letter' | 'number';
  val?: string | number; // e.g. 1, 2, 3 or 'circle' or 'red'
  color?: string;
  pulsePhase: number;
}

export interface ObstacleOrProp {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tree' | 'flower' | 'cloud' | 'rock' | 'bridge' | 'goalFriend' | 'water';
  color?: string;
  interactive?: boolean;
  state?: any;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'heart' | 'note' | 'bubble' | 'water' | 'flame' | 'smoke';
}

export interface BridgePuzzleState {
  active: boolean;
  requiredShape: 'circle' | 'square' | 'triangle' | 'star';
  options: ('circle' | 'square' | 'triangle' | 'star')[];
  solved: boolean;
  targetBridgeX: number;
}

export interface ColorPuzzleState {
  active: boolean;
  requiredColor: 'red' | 'blue' | 'yellow' | 'green';
  options: ('red' | 'blue' | 'yellow' | 'green')[];
  solved: boolean;
  targetX: number;
}
