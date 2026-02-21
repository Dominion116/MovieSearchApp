import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWatchlist, WatchlistMovie } from '@/context/watchlist-context';

export default function WatchlistScreen() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleClear = () => {
    Alert.alert(
      'Clear Watchlist',
      'Remove all saved movies? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearWatchlist,
        },
      ]
    );
  };

  const handleRemove = (movie: WatchlistMovie) => {
    Alert.alert(
      'Remove Movie',
      `Remove "${movie.Title}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlist(movie.imdbID),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: WatchlistMovie }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.imdbID}`)}
      activeOpacity={0.85}>
      <View style={styles.posterContainer}>
        {item.Poster && item.Poster !== 'N/A' ? (
          <Image source={{ uri: item.Poster }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.noPoster}>
            <Text style={styles.noPosterIcon}>🎬</Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.Title}
        </Text>
        <Text style={styles.cardYear}>{item.Year}</Text>
        <Text style={styles.addedDate}>Added {formatDate(item.addedAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>❤️ My Watchlist</Text>
          <Text style={styles.headerSubtitle}>
            {watchlist.length === 0
              ? 'No movies saved yet'
              : `${watchlist.length} movie${watchlist.length !== 1 ? 's' : ''} saved`}
          </Text>
        </View>
        {watchlist.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>
            Search for movies and tap the ❤️ button to save them to your watchlist.
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}>
            <Text style={styles.discoverBtnText}>Discover Movies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={watchlist}
          keyExtractor={(item) => item.imdbID}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  clearBtn: {
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  clearBtnText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  // List
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  posterContainer: {
    width: 60,
    height: 90,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  cardYear: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  addedDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: Colors.textTertiary,
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  discoverBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  discoverBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
