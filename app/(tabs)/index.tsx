import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';

const OMDB_API_KEY = 'trilogy';

// Featured genres / quick search chips
const QUICK_SEARCHES = ['Action', 'Comedy', 'Horror', 'Sci-Fi', 'Drama', 'Thriller'];

type Movie = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
};

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const searchMovies = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery.trim())}&type=movie`
      );
      const data = await res.json();
      if (data.Response === 'True') {
        setResults(data.Search || []);
        setTotalResults(parseInt(data.totalResults || '0', 10));
      } else {
        setResults([]);
        setTotalResults(0);
        setError(data.Error || 'No results found.');
      }
    } catch {
      setError('Network error. Please check your connection.');
      setResults([]);
    }
    setLoading(false);
  }, [query]);

  const handleQuickSearch = (chip: string) => {
    setQuery(chip);
    searchMovies(chip);
  };

  const renderMovieCard = ({ item, index }: { item: Movie; index: number }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.imdbID}`)}
      activeOpacity={0.85}>
      <View style={styles.posterWrapper}>
        {item.Poster !== 'N/A' ? (
          <Image source={{ uri: item.Poster }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.noPoster}>
            <Text style={styles.noPosterIcon}>🎬</Text>
          </View>
        )}
        <View style={styles.posterOverlay} />
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{item.Year}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.Title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>🎬 CineSearch</Text>
            <Text style={styles.tagline}>Millions of movies at your fingertips</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search movies, actors, directors..."
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => searchMovies()}
              returnKeyType="search"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
            onPress={() => searchMovies()}
            disabled={!query.trim() || loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Search Chips */}
        {!hasSearched && (
          <View style={styles.chipsRow}>
            {QUICK_SEARCHES.map((chip) => (
              <Pressable
                key={chip}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                onPress={() => handleQuickSearch(chip)}>
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Hero / Empty State */}
        {!hasSearched && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎥</Text>
            <Text style={styles.emptyTitle}>What will you watch?</Text>
            <Text style={styles.emptySubtitle}>
              Search for any movie title, actor, or director to get started.
            </Text>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Results Header */}
        {results.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsLabel}>
              Results for <Text style={styles.resultsQuery}>"{query}"</Text>
            </Text>
            <Text style={styles.resultsCount}>{totalResults.toLocaleString()} found</Text>
          </View>
        )}

        {/* Movie Grid */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.imdbID}
          renderItem={renderMovieCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Search
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 13 : 9,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDisabled: {
    opacity: 0.45,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipPressed: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Error
  errorBox: {
    marginHorizontal: Spacing.md,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },

  // Results header
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resultsQuery: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textTertiary,
  },

  // Grid
  grid: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  // Card
  card: {
    width: CARD_WIDTH as any,
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  noPoster: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  noPosterIcon: {
    fontSize: 40,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.7) 100%)' as any,
  },
  yearBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  yearText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
