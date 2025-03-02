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
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";
import { Timer } from "./_layout";

interface TimerHistoryScreenProps {
  completedTimers: Array<Timer & { completedAt: number }>;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

const TimerHistoryScreen: React.FC<TimerHistoryScreenProps> = ({
  completedTimers,
  clearHistory,
  removeHistoryItem,
}) => {
  // Export Timer History as JSON file
  const exportHistory = async () => {
    try {
      const json = JSON.stringify(completedTimers, null, 2);
      const fileUri = `${FileSystem.documentDirectory}timer_history.json`;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Export Complete", `File saved at: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export history.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Timer History</Text>
        {completedTimers.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={exportHistory}>
            <Ionicons name="download-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {completedTimers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>No completed timers yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Completed timers will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedTimers}
          keyExtractor={(item) => `${item.id}-${item.completedAt}`}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyItemContent}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyItemName}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeHistoryItem(item.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={18} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.completedAt}>
                  Completed: {new Date(item.completedAt).toLocaleString()}
                </Text>
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: "bold", flex: 1, textAlign: "center" },
  clearButton: { padding: 5 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateText: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  emptyStateSubtext: { fontSize: 14, color: "#999", marginTop: 5 },
  listContent: { padding: 15 },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  historyItemContent: { padding: 15 },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyItemName: { fontSize: 16, fontWeight: "bold" },
  removeButton: { padding: 5 },
  completedAt: { fontSize: 14, color: "#666", marginTop: 5 },
});

export default TimerHistoryScreen;
