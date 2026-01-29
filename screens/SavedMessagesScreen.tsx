import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Button } from "@react-navigation/elements";
import { useAtom, useAtomValue } from "jotai";

import { firebaseMessagesAtom } from "../atoms/app";
import { currentUserAtom } from "../atoms/auth";
import {
  listenToMyMessages,
  createMessage,
  deleteMessage,
  updateMessageName,
  updateMessage,
  getCurrentUser,
  type FirebaseMessage,
} from "../backend/fire";

/**
 * Props for the MessageItem component
 */
interface MessageItemProps {
  readonly item: FirebaseMessage;
  readonly onDelete: (id: string) => void;
  readonly onEditName: (id: string, newName: string) => void;
  readonly onEditMessage: (id: string, newMessage: string) => void;
}

/**
 * Individual message item component with edit/delete functionality
 */
function MessageItem(props: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(props.item.name);
  const [editedMessage, setEditedMessage] = useState(props.item.message);

  const handleSave = () => {
    if (editedName.trim() && editedMessage.trim()) {
      props.onEditName(props.item.id, editedName.trim());
      props.onEditMessage(props.item.id, editedMessage.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(props.item.name);
    setEditedMessage(props.item.message);
    setIsEditing(false);
  };

  return (
    <View style={styles.messageItem}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <Text style={styles.editLabel}>Name:</Text>
          <TextInput
            style={styles.editInput}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Message name"
          />
          <Text style={styles.editLabel}>Message:</Text>
          <TextInput
            style={[styles.editInput, styles.messageInput]}
            value={editedMessage}
            onChangeText={setEditedMessage}
            placeholder="Message content"
            multiline
            numberOfLines={3}
          />
          <View style={styles.editButtons}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.messageContent}>
          <View style={styles.messageInfo}>
            <Text style={styles.messageName}>{props.item.name}</Text>
            <Text style={styles.messageText}>{props.item.message}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => props.onDelete(props.item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Screen for managing saved messages from Firebase
 */
export function SavedMessagesScreen() {
  const [messages, setMessages] = useAtom(firebaseMessagesAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Listen to messages when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenToMyMessages((msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, setMessages]);

  /**
   * Create a new message
   */
  const handleCreate = async () => {
    if (!newName.trim() || !newMessage.trim()) {
      Alert.alert("Error", "Please fill in both name and message");
      return;
    }

    try {
      await createMessage(newName.trim(), newMessage.trim());
      setNewName("");
      setNewMessage("");
    } catch (err) {
      Alert.alert("Error", "Failed to create message");
    }
  };

  /**
   * Delete a message with confirmation
   */
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(id);
            } catch (err) {
              Alert.alert("Error", "Failed to delete message");
            }
          },
        },
      ],
    );
  };

  /**
   * Edit a message name
   */
  const handleEditName = async (id: string, newNameValue: string) => {
    try {
      await updateMessageName(id, newNameValue);
    } catch (err) {
      Alert.alert("Error", "Failed to update message name");
    }
  };

  /**
   * Edit a message content
   */
  const handleEditMessage = async (id: string, newMessageValue: string) => {
    try {
      await updateMessage(id, newMessageValue);
    } catch (err) {
      Alert.alert("Error", "Failed to update message content");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create new message form */}
      <View style={styles.createForm}>
        <Text style={styles.formTitle}>Add New Message</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Message (morse content)"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button onPress={handleCreate}>Create Message</Button>
      </View>

      {/* Messages list */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Saved Messages ({messages.length})</Text>
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>
            No messages yet. Create one above!
          </Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageItem
                item={item}
                onDelete={handleDelete}
                onEditName={handleEditName}
                onEditMessage={handleEditMessage}
              />
            )}
            style={styles.list}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#c62828",
    fontSize: 16,
  },
  createForm: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  list: {
    flex: 1,
  },
  messageItem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  messageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageInfo: {
    flex: 1,
    marginRight: 10,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  editContainer: {
    gap: 10,
  },
  editInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#2196f3",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
