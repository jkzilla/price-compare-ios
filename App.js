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

// Temporary flag: when true, the app will use local mock data instead of calling RapidAPI.
const USE_MOCK_DATA = true;

const MOCK_JSON = {
  results: [
    {
      id: 'milk-1',
      name: 'Whole Milk 1 Gallon',
      store: 'Store A',
      upc: '111111111111',
      current_price: 3.49,
    },
    {
      id: 'eggs-1',
      name: 'Large Eggs, Dozen',
      store: 'Store B',
      upc: '222222222222',
      current_price: 2.59,
    },
    {
      id: 'bread-1',
      name: 'White Sandwich Bread, 20oz',
      store: 'Store C',
      upc: '333333333333',
      current_price: 1.99,
    },
    {
      id: 'rice-1',
      name: 'Long Grain Rice, 2 lb',
      store: 'Store A',
      upc: '444444444444',
      current_price: 2.79,
    },
    {
      id: 'apples-1',
      name: 'Gala Apples, 3 lb Bag',
      store: 'Store D',
      upc: '555555555555',
      current_price: 4.49,
    },
    {
      id: 'bananas-1',
      name: 'Bananas, 1 lb',
      store: 'Store B',
      upc: '666666666666',
      current_price: 0.69,
    },
    {
      id: 'chicken-1',
      name: 'Boneless Skinless Chicken Breast, 1 lb',
      store: 'Store C',
      upc: '777777777777',
      current_price: 5.99,
    },
    {
      id: 'beef-1',
      name: 'Ground Beef 80/20, 1 lb',
      store: 'Store A',
      upc: '888888888888',
      current_price: 4.89,
    },
    {
      id: 'cheese-1',
      name: 'Cheddar Cheese Block, 8 oz',
      store: 'Store D',
      upc: '999999999999',
      current_price: 3.29,
    },
    {
      id: 'broccoli-1',
      name: 'Fresh Broccoli Crown, 1 lb',
      store: 'Store B',
      upc: '101010101010',
      current_price: 1.79,
    },
  ],
};

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
      const json = USE_MOCK_DATA
        ? MOCK_JSON
        : await (async () => {
            const url = `${RAPIDAPI_BASE_URL}${RAPIDAPI_PATH}?q=${encodeURIComponent(
              trimmed,
            )}`;

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

            return response.json();
          })();

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
    // Dark gradient-like backdrop for glass elements to sit on
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 42,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 16,
  },
  searchButtonsColumn: {
    justifyContent: 'flex-end',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    color: '#e5e7eb',
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#f9fafb',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '500',
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f97373',
    backgroundColor: '#7f1d1d',
    padding: 12,
    marginBottom: 10,
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  helperText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 6,
  },
  suggestionsContainer: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#111827',
    backgroundColor: '#020617',
    maxHeight: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.85)',
  },
  suggestionText: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 14,
  },
  resultsTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  cardDefault: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.32)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardHighlight: {
    backgroundColor: 'rgba(6, 78, 59, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.75)',
    shadowColor: '#22c55e',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    color: '#e5e7eb',
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
