import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Timer } from "@/app/(tabs)/_layout";

interface TimerListScreenProps {
  timers: Timer[];
  addTimer: (timer: {
    name: string;
    duration: number;
    category: string;
  }) => void;
  updateTimer: (timer: Timer) => void;
  performBulkAction: (
    category: string,
    action: "start" | "pause" | "reset"
  ) => void;
  navigateToHistory: () => void;
}

const DEFAULT_CATEGORIES = [
  "Workout",
  "Study",
  "Break",
  "Interview",
  "Meeting",
];

const TimerListScreen: React.FC<TimerListScreenProps> = ({
  timers,
  addTimer,
  updateTimer,
  performBulkAction,
  navigateToHistory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const animatedValues = useRef<Record<string, Animated.Value>>({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [completedModalVisible, setCompletedModalVisible] = useState(false);
  const [halfwayModalVisible, setHalfwayModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [halfwayTimer, setHalfwayTimer] = useState<Timer | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [newCategory, setNewCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [halfwayNotificationSent, setHalfwayNotificationSent] = useState<
    Record<string, boolean>
  >({});

  const allCategories = [...new Set(timers.map((timer) => timer.category))];

  useEffect(() => {
    const categories = [...new Set(timers.map((timer) => timer.category))];
    const newExpandedState: Record<string, boolean> = {};
    categories.forEach((category) => {
      newExpandedState[category] =
        expandedCategories[category] !== undefined
          ? expandedCategories[category]
          : true;
      if (!animatedValues.current[category]) {
        animatedValues.current[category] = new Animated.Value(1);
      }
    });
    setExpandedCategories(newExpandedState);
  }, [timers]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      timers.forEach((timer) => {
        if (timer.status === "Running" && timer.remainingTime > 0) {
          const updatedTimer = {
            ...timer,
            remainingTime: timer.remainingTime - 1,
          };

          const halfwayPoint = Math.floor(timer.duration / 2);
          if (
            updatedTimer.remainingTime === halfwayPoint &&
            !halfwayNotificationSent[timer.id]
          ) {
            setHalfwayTimer(updatedTimer);
            setHalfwayModalVisible(true);
            setHalfwayNotificationSent((prev) => ({
              ...prev,
              [timer.id]: true,
            }));
          }

          if (updatedTimer.remainingTime === 0) {
            updatedTimer.status = "Completed";
            setCompletedTimer(updatedTimer);
            setCompletedModalVisible(true);
            setHalfwayNotificationSent((prev) => ({
              ...prev,
              [timer.id]: false,
            }));
          }
          updateTimer(updatedTimer);
        }
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [timers, updateTimer, halfwayNotificationSent]);

  const handleAddTimer = () => {
    if (!name.trim()) {
      setFormError("Please enter a timer name");
      return;
    }
    const durationInSeconds = parseInt(duration);
    if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
      setFormError("Please enter a valid duration in seconds");
      return;
    }
    const selectedCategory = showCustomCategory ? newCategory : category;
    if (!selectedCategory.trim()) {
      setFormError("Please enter a category");
      return;
    }
    addTimer({
      name: name.trim(),
      duration: durationInSeconds,
      category: selectedCategory.trim(),
    });
    setName("");
    setDuration("");
    setCategory(DEFAULT_CATEGORIES[0]);
    setNewCategory("");
    setShowCustomCategory(false);
    setFormError(null);
    setAddModalVisible(false);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newState = { ...prev, [category]: !prev[category] };
      Animated.timing(animatedValues.current[category], {
        toValue: newState[category] ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return newState;
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "#4caf50";
      case "Paused":
        return "#ff9800";
      case "Completed":
        return "#9e9e9e";
      default:
        return "#000000";
    }
  };

  const handleResetTimer = (timer: Timer) => {
    updateTimer({
      ...timer,
      status: "Paused",
      remainingTime: timer.duration,
    });

    setHalfwayNotificationSent((prev) => ({
      ...prev,
      [timer.id]: false,
    }));
  };

  const categoriesToDisplay =
    filterCategory === "All"
      ? [...new Set(timers.map((timer) => timer.category))]
      : [filterCategory];

  const filteredTimers =
    filterCategory === "All"
      ? timers
      : timers.filter((timer) => timer.category === filterCategory);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Timers</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={navigateToHistory}
          >
            <Ionicons name="time-outline" size={22} color="white" />
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by category:</Text>
        <View style={styles.filterPickerContainer}>
          <Picker
            selectedValue={filterCategory}
            onValueChange={(itemValue) => setFilterCategory(itemValue)}
            style={styles.filterPicker}
          >
            <Picker.Item label="All Categories" value="All" />
            {allCategories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      {filteredTimers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="timer-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No timers found</Text>
          <Text style={styles.emptyStateSubtext}>
            {timers.length === 0
              ? "Tap the + button to create your first timer"
              : "Try changing your category filter"}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {categoriesToDisplay.map((category) => {
            const categoryTimers = filteredTimers.filter(
              (timer) => timer.category === category
            );
            return (
              <View key={category} style={styles.categoryContainer}>
                <View style={styles.categoryHeader}>
                  <TouchableOpacity
                    style={styles.categoryTitleContainer}
                    onPress={() => toggleCategory(category)}
                  >
                    <Ionicons
                      name={
                        expandedCategories[category]
                          ? "chevron-down"
                          : "chevron-forward"
                      }
                      size={20}
                      color="#333"
                    />
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Text style={styles.timerCount}>
                      {categoryTimers.length} timers
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.bulkActions}>
                    <TouchableOpacity
                      style={[styles.bulkActionButton, styles.startButton]}
                      onPress={() => performBulkAction(category, "start")}
                    >
                      <Ionicons name="play" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.bulkActionButton, styles.pauseButton]}
                      onPress={() => performBulkAction(category, "pause")}
                    >
                      <Ionicons name="pause" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.bulkActionButton, styles.resetButton]}
                      onPress={() => performBulkAction(category, "reset")}
                    >
                      <Ionicons name="refresh" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
                {expandedCategories[category] && (
                  <ScrollView
                    style={[
                      styles.timersList,
                      { maxHeight: categoryTimers.length > 2 ? 200 : null },
                    ]}
                    nestedScrollEnabled={true}
                  >
                    {categoryTimers.map((timer) => {
                      const progressPercentage = Math.max(
                        0,
                        Math.min(
                          100,
                          (timer.remainingTime / timer.duration) * 100
                        )
                      );
                      return (
                        <View key={timer.id} style={styles.timerItem}>
                          <View style={styles.timerInfo}>
                            <Text style={styles.timerName}>{timer.name}</Text>
                            <Text style={styles.timerTime}>
                              {formatTime(timer.remainingTime)}
                            </Text>
                            <Text
                              style={[
                                styles.timerStatus,
                                { color: getStatusColor(timer.status) },
                              ]}
                            >
                              {timer.status}
                            </Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                { width: `${progressPercentage}%` },
                              ]}
                            />
                          </View>
                          <View style={styles.timerControls}>
                            {timer.status !== "Completed" && (
                              <TouchableOpacity
                                style={[
                                  styles.timerControl,
                                  styles.startControl,
                                  timer.status === "Running" &&
                                    styles.disabledButton,
                                ]}
                                onPress={() =>
                                  updateTimer({ ...timer, status: "Running" })
                                }
                                disabled={timer.status === "Running"}
                              >
                                <Ionicons
                                  name="play"
                                  size={18}
                                  color={
                                    timer.status === "Running"
                                      ? "#aaa"
                                      : "white"
                                  }
                                />
                              </TouchableOpacity>
                            )}
                            {timer.status === "Running" && (
                              <TouchableOpacity
                                style={[
                                  styles.timerControl,
                                  styles.pauseControl,
                                ]}
                                onPress={() =>
                                  updateTimer({ ...timer, status: "Paused" })
                                }
                              >
                                <Ionicons
                                  name="pause"
                                  size={18}
                                  color="white"
                                />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={[styles.timerControl, styles.resetControl]}
                              onPress={() => handleResetTimer(timer)}
                            >
                              <Ionicons
                                name="refresh"
                                size={18}
                                color="white"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal
        transparent={true}
        visible={addModalVisible}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAddModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Timer</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {formError && <Text style={styles.errorText}>{formError}</Text>}
            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Timer Name:</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter timer name (e.g., Coding Interview)"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Duration (in seconds):</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Enter duration in seconds"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category:</Text>
                {!showCustomCategory ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={category}
                      onValueChange={(itemValue) => setCategory(itemValue)}
                      style={styles.picker}
                    >
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="Enter custom category"
                  />
                )}
                <TouchableOpacity
                  onPress={() => setShowCustomCategory(!showCustomCategory)}
                  style={styles.toggleButton}
                >
                  <Text style={styles.toggleButtonText}>
                    {showCustomCategory
                      ? "Select from defaults"
                      : "Add custom category"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddTimer}
            >
              <Text style={styles.submitButtonText}>Create Timer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        transparent={true}
        visible={completedModalVisible}
        animationType="fade"
        onRequestClose={() => setCompletedModalVisible(false)}
      >
        <View style={styles.completedModalOverlay}>
          <View style={styles.completedModalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.completedTimerText}>
              "{completedTimer?.name}" timer is complete!
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCompletedModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={halfwayModalVisible}
        animationType="fade"
        onRequestClose={() => setHalfwayModalVisible(false)}
      >
        <View style={styles.completedModalOverlay}>
          <View style={styles.completedModalContent}>
            <Ionicons name="alert-circle" size={60} color="#ff9800" />
            <Text style={styles.alertText}>Halfway Point!</Text>
            <Text style={styles.completedTimerText}>
              "{halfwayTimer?.name}" timer has reached 50%!
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setHalfwayModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2196f3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#666",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f0f0",
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  timerCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  bulkActions: {
    flexDirection: "row",
  },
  bulkActionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: "#4caf50",
  },
  pauseButton: {
    backgroundColor: "#ff9800",
  },
  resetButton: {
    backgroundColor: "#2196f3",
  },
  timersList: {
    backgroundColor: "white",
  },
  timerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  timerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timerName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  timerTime: {
    fontSize: 16,
    fontFamily: "monospace",
    marginRight: 10,
  },
  timerStatus: {
    fontSize: 14,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2196f3",
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  timerControl: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  startControl: {
    backgroundColor: "#4caf50",
  },
  pauseControl: {
    backgroundColor: "#ff9800",
  },
  resetControl: {
    backgroundColor: "#2196f3",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  picker: {
    height: 50,
  },
  toggleButton: {
    padding: 10,
    alignItems: "flex-end",
  },
  toggleButtonText: {
    color: "#0066cc",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  completedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  completedModalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    width: "80%",
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
  completedTimerText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 15,
    color: "#666",
  },
  closeModalButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyButton: {
    backgroundColor: "#9c27b0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  historyButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  filterContainer: {
    backgroundColor: "white",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  filterPickerContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterPicker: {
    height: 60,
  },
  alertText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#ff9800",
  },
});

export default TimerListScreen;
