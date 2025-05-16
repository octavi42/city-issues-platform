import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a fun, unique username by combining a random color, animal, and number.
 * Example: BlueTiger123
 */
export function generateUsername(): string {
  const animals = [
    "Lion", "Tiger", "Bear", "Wolf", "Fox", "Eagle", "Hawk", "Panther", "Shark", "Falcon",
    "Otter", "Panda", "Leopard", "Cobra", "Jaguar", "Moose", "Bison", "Coyote", "Raven", "Lynx"
  ];
  const colors = [
    "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Silver", "Gold", "Crimson", "Azure",
    "Emerald", "Violet", "Amber", "Teal", "Indigo", "Coral", "Ivory", "Sable", "Rose", "Slate"
  ];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const number = Math.floor(Math.random() * 10000); // 0-9999
  return `${color}${animal}${number}`;
}
