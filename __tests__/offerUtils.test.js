import { extractOffers, mapOffersToViewModel, sortOffersByPrice } from '../src/offerUtils';

describe('offerUtils', () => {
  test('extractOffers returns items array from different keys', () => {
    expect(extractOffers({ items: [1, 2] })).toEqual([1, 2]);
    expect(extractOffers({ results: [3] })).toEqual([3]);
    expect(extractOffers({ offers: [4, 5] })).toEqual([4, 5]);
    expect(extractOffers({})).toEqual([]);
  });

  test('mapOffersToViewModel maps common price fields and ids', () => {
    const offers = [
      { id: '1', title: 'Eggs A', price: 2.5, retailer: 'Store A', sku: 'SKU1' },
      { name: 'Eggs B', salePrice: '3.10', store: 'Store B', upc: 'UPC1' },
    ];

    const mapped = mapOffersToViewModel(offers);

    expect(mapped[0]).toMatchObject({
      id: '1',
      title: 'Eggs A',
      retailer: 'Store A',
      sku: 'SKU1',
      price: 2.5,
    });

    expect(mapped[1]).toMatchObject({
      title: 'Eggs B',
      retailer: 'Store B',
      sku: 'UPC1',
      price: '3.10',
    });
  });

  test('sortOffersByPrice sorts by numeric price, cheapest first', () => {
    const offers = [
      { id: 'a', price: 4 },
      { id: 'b', price: '2.5' },
      { id: 'c', price: null },
    ];

    const sorted = sortOffersByPrice(offers);

    expect(sorted.map((o) => o.id)).toEqual(['b', 'a', 'c']);
  });
});
