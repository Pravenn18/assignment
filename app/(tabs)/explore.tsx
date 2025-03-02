// First, let's create a history screen component
// app/history.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import { HistoryEntry } from "./_layout";

interface HistoryScreenProps {
  historyEntries: any;
  clearHistory: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyEntries,
  clearHistory,
}) => {
  const router = useRouter();

  // Format date function
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format duration function
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Confirm clear history
  const confirmClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearHistory },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Timer History</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={confirmClearHistory}
          disabled={historyEntries.length === 0}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={historyEntries.length === 0 ? "#ccc" : "#ff3b30"}
          />
        </TouchableOpacity>
      </View>

      {historyEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No history yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Completed timers will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={historyEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyItemName}>{item.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.historyItemDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Duration: {formatDuration(item.duration)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Completed: {formatDate(item.completedAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    padding: 5,
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
  listContent: {
    padding: 15,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
  },
  historyItemDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
});

export default HistoryScreen;

// Now, let's update the _layout.tsx file
