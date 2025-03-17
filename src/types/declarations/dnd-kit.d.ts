
declare module '@dnd-kit/core' {
  export interface DndContextProps {
    sensors?: any[];
    collisionDetection?: any;
    modifiers?: any[];
    onDragStart?: (event: any) => void;
    onDragMove?: (event: any) => void;
    onDragEnd?: (event: any) => void;
    onDragCancel?: (event: any) => void;
  }

  export function DndContext(props: DndContextProps & React.PropsWithChildren<{}>): JSX.Element;
  export function useSensor(sensor: any, options?: any): any;
  export function useSensors(...sensors: any[]): any[];
  export function MouseSensor(options?: any): any;
  export function TouchSensor(options?: any): any;
  export function KeyboardSensor(options?: any): any;
  export function pointerWithin(args?: any): any;
  export function rectIntersection(args?: any): any;
  export function closestCenter(args?: any): any;
  export interface DragEndEvent {
    active: { id: string | number };
    over: { id: string | number } | null;
  }
  export interface PointerSensor {
    new(options?: any): any;
  }
  export interface SensorDescriptor<T = any> {
    sensor: T;
    options?: any;
  }
}

declare module '@dnd-kit/sortable' {
  export function SortableContext(props: { items: any[]; strategy?: any } & React.PropsWithChildren<{}>): JSX.Element;
  export function useSortable(args: { id: string | number }): any;
  export function verticalListSortingStrategy(args?: any): any;
  export function horizontalListSortingStrategy(args?: any): any;
  export function rectSortingStrategy(args?: any): any;
  export function arrayMove<T>(array: T[], from: number, to: number): T[];
  export function sortableKeyboardCoordinates(args?: any): any;
}

declare module '@dnd-kit/utilities' {
  export const CSS: {
    Transform: {
      toString(args?: any): string;
    };
    Transition: {
      toString(args?: any): string;
    };
  };
}
