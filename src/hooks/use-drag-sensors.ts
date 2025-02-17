
import { useSensors, useSensor, PointerSensor, KeyboardSensor, type SensorDescriptor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export function useDragSensors(): SensorDescriptor<any>[] {
  return useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
