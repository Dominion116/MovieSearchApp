import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWatchlist } from '@/context/watchlist-context';

const OMDB_API_KEY = 'trilogy';

type MovieDetail = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  Metascore: string;
  Type: string;
  BoxOffice: string;
};

function MetaChip({ label, value }: { label: string; value: string }) {
  if (!value || value === 'N/A') return null;
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipLabel}>{label}</Text>
      <Text style={styles.metaChipValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value || value === 'N/A') return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StarRating({ rating }: { rating: string }) {
  const num = parseFloat(rating);
  if (isNaN(num)) return null;
  const stars = Math.round(num / 2);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, i <= stars ? styles.starFilled : styles.starEmpty]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function MovieDetailScreen() {
  const { imdbID } = useLocalSearchParams<{ imdbID: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const isSaved = movie ? isInWatchlist(imdbID as string) : false;

  const handleToggle = () => {
    if (!movie) return;
    toggleWatchlist({
      imdbID: imdbID as string,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      Type: movie.Type,
    });
  };

  useEffect(() => {
    if (!imdbID) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`
        );
        const data = await res.json();
        if (data.Response === 'True') {
          setMovie(data);
        } else {
          setError(data.Error || 'Movie not found.');
        }
      } catch {
        setError('Network error. Please check your connection.');
      }
      setLoading(false);
    })();
  }, [imdbID]);

  const hasPoster = movie?.Poster && movie.Poster !== 'N/A';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {movie && (
          <TouchableOpacity style={styles.heartBtn} onPress={handleToggle} activeOpacity={0.7}>
            <Text style={[styles.heartIcon, isSaved && styles.heartSaved]}>
              {isSaved ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {movie && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Hero Poster */}
          <View style={styles.heroContainer}>
            {hasPoster ? (
              <Image source={{ uri: movie.Poster }} style={styles.heroPoster} resizeMode="cover" />
            ) : (
              <View style={styles.noPoster}>
                <Text style={styles.noPosterIcon}>🎬</Text>
              </View>
            )}
            {/* Gradient overlay */}
            <View style={styles.heroGradient} />

            {/* Rating badge */}
            {movie.imdbRating && movie.imdbRating !== 'N/A' && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingValue}>{movie.imdbRating}</Text>
                <Text style={styles.ratingMax}>/10</Text>
              </View>
            )}
          </View>

          {/* Main Info */}
          <View style={styles.mainInfo}>
            <Text style={styles.movieTitle}>{movie.Title}</Text>

            {/* Stars */}
            <StarRating rating={movie.imdbRating} />

            {/* Meta chips */}
            <View style={styles.metaChipsRow}>
              <MetaChip label="Year" value={movie.Year} />
              <MetaChip label="Rated" value={movie.Rated} />
              <MetaChip label="Runtime" value={movie.Runtime} />
            </View>

            {/* Genre tags */}
            {movie.Genre && movie.Genre !== 'N/A' && (
              <View style={styles.genreRow}>
                {movie.Genre.split(', ').map((g) => (
                  <View key={g} style={styles.genreTag}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Plot */}
            {movie.Plot && movie.Plot !== 'N/A' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Plot</Text>
                <Text style={styles.plotText}>{movie.Plot}</Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {movie.imdbVotes && movie.imdbVotes !== 'N/A' && (
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{movie.imdbVotes}</Text>
                  <Text style={styles.statLabel}>IMDb Votes</Text>
                </View>
              )}
              {movie.Metascore && movie.Metascore !== 'N/A' && (
                <View style={[styles.statBlock, styles.statBlockBorder]}>
                  <Text style={[styles.statValue, { color: Colors.gold }]}>{movie.Metascore}</Text>
                  <Text style={styles.statLabel}>Metascore</Text>
                </View>
              )}
              {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                <View style={[styles.statBlock, styles.statBlockBorder]}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>{movie.BoxOffice}</Text>
                  <Text style={styles.statLabel}>Box Office</Text>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Director" value={movie.Director} />
                <InfoRow label="Writer" value={movie.Writer} />
                <InfoRow label="Actors" value={movie.Actors} />
                <InfoRow label="Language" value={movie.Language} />
                <InfoRow label="Country" value={movie.Country} />
                <InfoRow label="Released" value={movie.Released} />
              </View>
            </View>

            {/* Awards */}
            {movie.Awards && movie.Awards !== 'N/A' && (
              <View style={styles.awardsBox}>
                <Text style={styles.awardsIcon}>🏆</Text>
                <Text style={styles.awardsText}>{movie.Awards}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating save bar */}
      {movie && (
        <View style={styles.floatingBar}>
          <TouchableOpacity
            style={[styles.floatingBtn, isSaved && styles.floatingBtnSaved]}
            onPress={handleToggle}
            activeOpacity={0.8}>
            <Text style={styles.floatingBtnIcon}>{isSaved ? '❤️' : '🤍'}</Text>
            <Text style={[styles.floatingBtnText, isSaved && styles.floatingBtnTextSaved]}>
              {isSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  backText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 20,
  },
  heartSaved: {
    // style marker for saved state (emoji changes)
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: 15,
  },
  errorEmoji: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // Hero
  heroContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  heroPoster: {
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
    fontSize: 72,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    // Simulate gradient with a bottom-biased overlay
    backgroundColor: 'transparent',
    borderBottomWidth: 120,
    borderBottomColor: Colors.background,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    top: 'auto' as any,
    height: 0,
    width: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingValue: {
    color: Colors.gold,
    fontWeight: '800',
    fontSize: 16,
  },
  ratingMax: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  // Main info
  mainInfo: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  movieTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: Spacing.md,
  },
  star: {
    fontSize: 18,
  },
  starFilled: {
    color: Colors.gold,
  },
  starEmpty: {
    color: Colors.textMuted,
  },

  // Meta chips
  metaChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  metaChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaChipLabel: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  metaChipValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  // Genre
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  genreTag: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  genreText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Section
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  plotText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statBlockBorder: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    width: 80,
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Awards
  awardsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.goldSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  awardsIcon: {
    fontSize: 20,
  },
  awardsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gold,
    lineHeight: 22,
    fontWeight: '500',
  },

  // Floating bar
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floatingBtnSaved: {
    backgroundColor: Colors.accentSoft,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  floatingBtnIcon: {
    fontSize: 18,
  },
  floatingBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  floatingBtnTextSaved: {
    color: Colors.accent,
  },
});
