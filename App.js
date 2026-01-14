import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { extractOffers, mapOffersToViewModel, sortOffersByPrice } from './src/offerUtils';

const RAPIDAPI_BASE_URL = 'https://example-rapidapi-endpoint.com';
const RAPIDAPI_PATH = '/search';
const RAPIDAPI_HOST = 'example-rapidapi-endpoint.com';
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE';

const PRODUCT_SUGGESTIONS = [
  'Whole milk 1 gallon',
  'Large eggs, dozen',
  'White sandwich bread',
  'Long grain rice 2 lb',
  'Gala apples 3 lb bag',
  'Bananas',
  'Chicken breast',
  'Ground beef 80/20',
  'Cheddar cheese block',
  'Fresh broccoli',
];

export default function App() {
  const [query, setQuery] = useState('eggs');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sortedResults = useMemo(() => sortOffersByPrice(results), [results]);

  const cheapestId = sortedResults[0]?.id;

  const handleSearch = async (overrideQuery) => {
    const trimmed = (overrideQuery ?? query).trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${RAPIDAPI_BASE_URL}${RAPIDAPI_PATH}?q=${encodeURIComponent(trimmed)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      const offers = extractOffers(json);
      const mapped = mapOffersToViewModel(offers);

      setResults(mapped);
      setShowSuggestions(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🥚</Text>
          <Text style={styles.title}>Price Compare</Text>
          <Text style={styles.subtitle}>Search product SKU or name and compare offers.</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Product or SKU</Text>
            <TextInput
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setShowSuggestions(true);
              }}
              placeholder="e.g. large eggs, UPC, SKU"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
              onBlur={() => {
                // small delay so taps on suggestions still register
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onFocus={() => {
                if (query.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {showSuggestions && (
              <View style={styles.suggestionsContainer}>
                {PRODUCT_SUGGESTIONS.filter((item) => {
                  const trimmed = query.trim().toLowerCase();
                  if (!trimmed) return true;
                  return item.toLowerCase().includes(trimmed);
                }).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.searchButtonsColumn}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => handleSearch()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Searching…' : 'Compare'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={() => {
                setQuery('');
                setShowSuggestions(true);
              }}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>All products</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : null}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#a5b4fc" />
            <Text style={styles.loadingText}>Fetching offers…</Text>
          </View>
        )}

        {!loading && !error && results.length === 0 && (
          <Text style={styles.helperText}>Enter a query above and tap Compare to see offers.</Text>
        )}

        {!loading && results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Offers ({results.length})</Text>
            <FlatList
              data={sortedResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const priceNumber =
                  typeof item.price === 'number' ? item.price : Number(item.price) || null;
                const isCheapest = item.id === cheapestId;

                return (
                  <View
                    style={[
                      styles.card,
                      isCheapest ? styles.cardHighlight : styles.cardDefault,
                    ]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardRetailer}>{item.retailer}</Text>
                      {isCheapest && <Text style={styles.cheapestBadge}>Cheapest</Text>}
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.sku && (
                      <Text style={styles.cardSku}>SKU: {item.sku}</Text>
                    )}
                    <View style={styles.cardFooterRow}>
                      <Text style={styles.cardPrice}>
                        {priceNumber != null ? `$${priceNumber.toFixed(2)}` : 'No price'}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  searchButtonsColumn: {
    justifyContent: 'flex-end',
    gap: 6,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f97373',
    backgroundColor: '#7f1d1d',
    padding: 10,
    marginBottom: 8,
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  helperText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#020617',
    maxHeight: 160,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  suggestionText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 8,
  },
  resultsTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  cardDefault: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHighlight: {
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardRetailer: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 14,
  },
  cheapestBadge: {
    color: '#bbf7d0',
    backgroundColor: '#166534',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 4,
  },
  cardSku: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '700',
  },
});
