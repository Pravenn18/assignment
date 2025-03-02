import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import TimerListScreen from "@/screen/TimerListScreen";
import TimerHistoryScreen from "@/screen/TimerHistoryScreen";

export interface Timer {
  id: string;
  name: string;
  duration: number;
  category: string;
  remainingTime: number;
  status: "Running" | "Paused" | "Completed";
}

export interface CompletedTimer extends Timer {
  completedAt: number;
}

export default function AppLayout() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTimers = await AsyncStorage.getItem("timers");
        if (savedTimers !== null) {
          const parsedTimers = JSON.parse(savedTimers);
          console.log("Loaded timers:", parsedTimers);
          setTimers(parsedTimers);
        }

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

  const addTimer = (timer: Omit<Timer, "id" | "status" | "remainingTime">) => {
    const newTimer: Timer = {
      ...timer,
      id: Date.now().toString(),
      status: "Paused",
      remainingTime: timer.duration,
    };
    setTimers((prevTimers) => [...prevTimers, newTimer]);
  };

  const updateTimer = (updatedTimer: Timer) => {
    setTimers((prevTimers) => {
      const newTimers = prevTimers.map((timer) =>
        timer.id === updatedTimer.id ? updatedTimer : timer
      );

      if (
        updatedTimer.status === "Completed" &&
        updatedTimer.remainingTime === 0
      ) {
        const completedTimer: CompletedTimer = {
          ...updatedTimer,
          completedAt: Date.now(),
        };

        const existingIndex = completedTimers.findIndex(
          (t) => t.id === completedTimer.id
        );

        if (existingIndex === -1) {
          setCompletedTimers((prev) => [...prev, completedTimer]);
        }
      }

      return newTimers;
    });
  };

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

  const clearHistory = () => {
    setCompletedTimers([]);
  };

  const removeHistoryItem = (id: string) => {
    setCompletedTimers((prev) => prev.filter((timer) => timer.id !== id));
  };

  const renderScreen = () => {
    console.log("pathname", pathname);
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

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}
