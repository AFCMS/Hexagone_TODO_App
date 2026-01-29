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
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  readonly onEdit: (id: string) => void;
}

/**
 * Props for the EditMessageModal component
 */
interface EditMessageModalProps {
  readonly visible: boolean;
  readonly message: FirebaseMessage | null;
  readonly onSave: (id: string, name: string, message: string) => void;
  readonly onCancel: () => void;
}

/**
 * Modal component for editing messages
 */
function EditMessageModal(props: EditMessageModalProps) {
  const [editedName, setEditedName] = useState("");
  const [editedMessage, setEditedMessage] = useState("");

  // Update local state when message changes
  useEffect(() => {
    if (props.message) {
      setEditedName(props.message.name);
      setEditedMessage(props.message.message);
    }
  }, [props.message]);

  const handleSave = () => {
    if (props.message && editedName.trim() && editedMessage.trim()) {
      props.onSave(props.message.id, editedName.trim(), editedMessage.trim());
    }
  };

  const handleCancel = () => {
    props.onCancel();
  };

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Message</Text>
          <Pressable style={styles.closeButton} onPress={handleCancel}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.editLabel}>Name:</Text>
          <TextInput
            style={styles.modalInput}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Message name"
            autoFocus
          />

          <Text style={styles.editLabel}>Message:</Text>
          <TextInput
            style={[styles.modalInput, styles.messageInput]}
            value={editedMessage}
            onChangeText={setEditedMessage}
            placeholder="Message content"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View style={styles.modalButtons}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * Individual message item component with edit/delete functionality
 */
function MessageItem(props: MessageItemProps) {
  return (
    <View style={styles.messageItem}>
      <View style={styles.messageContent}>
        <View style={styles.messageInfo}>
          <Text style={styles.messageName}>{props.item.name}</Text>
          <Text style={styles.messageText}>{props.item.message}</Text>
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.editButton}
            onPress={() => props.onEdit(props.item.id)}
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
  const [editingMessage, setEditingMessage] = useState<FirebaseMessage | null>(
    null,
  );

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

  /**
   * Open edit modal for a message
   */
  const handleEdit = (id: string) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      setEditingMessage(message);
    }
  };

  /**
   * Save changes from modal
   */
  const handleModalSave = async (id: string, name: string, message: string) => {
    try {
      await updateMessageName(id, name);
      await updateMessage(id, message);
      setEditingMessage(null);
    } catch (err) {
      Alert.alert("Error", "Failed to update message");
    }
  };

  /**
   * Close the edit modal
   */
  const handleModalCancel = () => {
    setEditingMessage(null);
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
                onEdit={handleEdit}
              />
            )}
            style={styles.list}
          />
        )}
      </View>

      <EditMessageModal
        visible={editingMessage !== null}
        message={editingMessage}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#2196f3",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});
