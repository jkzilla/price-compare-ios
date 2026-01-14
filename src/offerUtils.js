export function extractOffers(json) {
  const items = json?.items ?? json?.results ?? json?.offers ?? [];
  return Array.isArray(items) ? items : [];
}

export function mapOffersToViewModel(offers) {
  return offers.map((item, index) => {
    const price =
      item?.price?.value ??
      item?.price ??
      item?.salePrice ??
      item?.unit_price ??
      item?.current_price ??
      null;

    return {
      id: String(item?.id ?? item?.sku ?? item?.asin ?? index),
      title: String(item?.title ?? item?.name ?? 'Unknown product'),
      retailer: String(
        item?.retailer ?? item?.store ?? item?.merchant ?? item?.seller ?? 'Unknown retailer'
      ),
      sku: item?.sku ?? item?.upc ?? item?.asin ?? null,
      price,
      raw: item,
    };
  });
}

export function sortOffersByPrice(viewModels) {
  return [...viewModels].sort((a, b) => {
    const ap = typeof a.price === 'number' ? a.price : Number(a.price) || Infinity;
    const bp = typeof b.price === 'number' ? b.price : Number(b.price) || Infinity;
    return ap - bp;
  });
}
