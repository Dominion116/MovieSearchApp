import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Using OMDb API for demonstration (replace with your API key)
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=YOUR_API_KEY&s=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.Search || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movie Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a movie..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchMovies}
        returnKeyType="search"
      />
      <Button title="Search" onPress={searchMovies} disabled={loading} />
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.imdbID}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/${item.imdbID}`)}
            style={styles.item}
          >
            {item.Poster !== "N/A" && (
              <Image source={{ uri: item.Poster }} style={styles.poster} />
            )}
            <Text style={styles.movieTitle}>
              {item.Title} ({item.Year})
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  item: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  poster: { width: 50, height: 75, marginRight: 12, borderRadius: 4 },
  movieTitle: { fontSize: 16, flexShrink: 1 },
});
