class Product {
  final String? id;
  final String name;
  final String type;
  final String? description;
  final List<String> image;
  final String status;
  final ProductOffers offers;
  final String? category;
  final String? updatedAt;

  Product({
    this.id,
    required this.name,
    required this.type,
    this.description,
    required this.image,
    required this.status,
    required this.offers,
    this.category,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] as String?,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'Product',
      description: json['description'] as String?,
      image: json['image'] is List ? List<String>.from(json['image']) : [],
      status: json['status'] as String? ?? 'draft',
      offers: ProductOffers.fromJson(json['offers'] ?? {}),
      category: json['category'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }
}

class ProductOffers {
  final double price;
  final String priceCurrency;

  ProductOffers({
    required this.price,
    required this.priceCurrency,
  });

  factory ProductOffers.fromJson(Map<String, dynamic> json) {
    return ProductOffers(
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      priceCurrency: json['priceCurrency'] as String? ?? 'KES',
    );
  }
}
