import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import builtinMessages from "../utils/messages";
import { hasFeedbackBackendsEnabledAtom } from "../atoms/settings";
import { playbackIsPlayingAtom, playbackMessageAtom } from "../atoms/app";

export default function ListMessages() {
  const hasFeedbackBackendsEnabled = useAtomValue(
    hasFeedbackBackendsEnabledAtom,
  );
  const playbackIsPlaying = useAtomValue(playbackIsPlayingAtom);

  const setPlaybackMessage = useSetAtom(playbackMessageAtom);

  return (
    <FlatList
      style={styles.list}
      data={builtinMessages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            setPlaybackMessage(item.title);
          }}
          disabled={!hasFeedbackBackendsEnabled || playbackIsPlaying}
          style={{
            marginBottom: 15,
            opacity: !hasFeedbackBackendsEnabled || playbackIsPlaying ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
          <Text>{item.description}</Text>
          <Text>Status: {item.favorite ? "Fav" : "Not Fav"}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: "90%",
    marginTop: 40,
  },
});
