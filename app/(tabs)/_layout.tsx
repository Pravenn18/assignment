import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import TimerListScreen from ".";
import TimerHistoryScreen from "./explore";

// Define Timer type
export interface Timer {
  id: string;
  name: string;
  duration: number;
  category: string;
  remainingTime: number;
  status: "Running" | "Paused" | "Completed";
}

// Define CompletedTimer type with timestamp
export interface CompletedTimer extends Timer {
  completedAt: number;
}

export default function AppLayout() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load timers and history from storage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active timers
        const savedTimers = await AsyncStorage.getItem("timers");
        if (savedTimers !== null) {
          const parsedTimers = JSON.parse(savedTimers);
          console.log("Loaded timers:", parsedTimers);
          setTimers(parsedTimers);
        }

        // Load timer history
        const savedHistory = await AsyncStorage.getItem("timerHistory");
        if (savedHistory !== null) {
          const parsedHistory = JSON.parse(savedHistory);
          console.log("Loaded history data:", parsedHistory);
          setCompletedTimers(parsedHistory);
        } else {
          console.log("No history data found in storage");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Save timers to storage whenever they change
  useEffect(() => {
    const saveTimers = async () => {
      try {
        await AsyncStorage.setItem("timers", JSON.stringify(timers));
        console.log("Saved timers:", timers.length);
      } catch (error) {
        console.error("Error saving timers:", error);
      }
    };

    saveTimers();
  }, [timers]);

  // Save completed timers to storage whenever they change
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(
          "timerHistory",
          JSON.stringify(completedTimers)
        );
        console.log("Saved history items:", completedTimers.length);
      } catch (error) {
        console.error("Error saving timer history:", error);
      }
    };

    if (completedTimers.length > 0 || completedTimers.length === 0) {
      saveHistory();
    }
  }, [completedTimers]);

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
    setTimers((prevTimers) => {
      const newTimers = prevTimers.map((timer) =>
        timer.id === updatedTimer.id ? updatedTimer : timer
      );

      // If the timer just completed, add it to history
      if (
        updatedTimer.status === "Completed" &&
        updatedTimer.remainingTime === 0
      ) {
        const completedTimer: CompletedTimer = {
          ...updatedTimer,
          completedAt: Date.now(),
        };

        // Check if it already exists in completed timers before adding
        const existingIndex = completedTimers.findIndex(
          (t) => t.id === completedTimer.id
        );

        if (existingIndex === -1) {
          // Add the completed timer to the history list without direct AsyncStorage call
          setCompletedTimers((prev) => [...prev, completedTimer]);
        }
      }

      return newTimers;
    });
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

  // Clear all history
  const clearHistory = () => {
    setCompletedTimers([]);
    // The useEffect will handle the AsyncStorage update
  };

  // Remove single history item
  const removeHistoryItem = (id: string) => {
    setCompletedTimers((prev) => prev.filter((timer) => timer.id !== id));
    // The useEffect will handle the AsyncStorage update
  };

  // Render appropriate screen based on path
  const renderScreen = () => {
    // Explicitly check for history screen path
    if (pathname === "/explore") {
      return (
        <TimerListScreen
          timers={timers}
          addTimer={addTimer}
          updateTimer={updateTimer}
          performBulkAction={performBulkAction}
          navigateToHistory={() => router.push("/(tabs)")}
        />
      );
    }
    return (
      <TimerHistoryScreen
        completedTimers={completedTimers}
        clearHistory={clearHistory}
        removeHistoryItem={removeHistoryItem}
      />
    );
  };

  // Use a consistent wrapper for both screens
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}
