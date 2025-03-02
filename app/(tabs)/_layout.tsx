import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TimerListScreen from ".";

// Define Timer type
export interface Timer {
  id: string;
  name: string;
  duration: number;
  category: string;
  remainingTime: number;
  status: "Running" | "Paused" | "Completed";
}

export default function App() {
  const [timers, setTimers] = useState<Timer[]>([]);

  // Load timers from storage on app start
  useEffect(() => {
    const loadTimers = async () => {
      try {
        const savedTimers = await AsyncStorage.getItem("timers");
        if (savedTimers !== null) {
          setTimers(JSON.parse(savedTimers));
        }
      } catch (error) {
        console.error("Error loading timers:", error);
      }
    };

    loadTimers();
  }, []);

  // Save timers to storage whenever they change
  useEffect(() => {
    const saveTimers = async () => {
      try {
        await AsyncStorage.setItem("timers", JSON.stringify(timers));
      } catch (error) {
        console.error("Error saving timers:", error);
      }
    };

    saveTimers();
  }, [timers]);

  // Add a new timer
  const addTimer = (timer: Omit<Timer, "id" | "status" | "remainingTime">) => {
    const newTimer: Timer = {
      ...timer,
      id: Date.now().toString(),
      status: "Paused",
      remainingTime: timer.duration,
    };
    setTimers((prevTimers) => [...prevTimers, newTimer]);
  };

  // Update timer (for start, pause, reset, etc.)
  const updateTimer = (updatedTimer: Timer) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === updatedTimer.id ? updatedTimer : timer
      )
    );
  };

  // Bulk actions for timers in a category
  const performBulkAction = (
    category: string,
    action: "start" | "pause" | "reset"
  ) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.category === category) {
          switch (action) {
            case "start":
              return { ...timer, status: "Running" };
            case "pause":
              return { ...timer, status: "Paused" };
            case "reset":
              return {
                ...timer,
                status: "Paused",
                remainingTime: timer.duration,
              };
            default:
              return timer;
          }
        }
        return timer;
      })
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <TimerListScreen
        timers={timers}
        addTimer={addTimer}
        updateTimer={updateTimer}
        performBulkAction={performBulkAction}
      />
    </SafeAreaProvider>
  );
}
