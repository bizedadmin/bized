class Service {
  final String? id;
  final String name;
  final String? description;
  final String? serviceType;
  final String? category;
  final List<String> image;
  final ServiceOffers? offers;
  final int? duration;
  final String status;

  Service({
    this.id,
    required this.name,
    this.description,
    this.serviceType,
    this.category,
    required this.image,
    this.offers,
    this.duration,
    required this.status,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['_id'] as String?,
      name: json['name'] as String,
      description: json['description'] as String?,
      serviceType: json['serviceType'] as String?,
      category: json['category'] as String?,
      image: json['image'] is List ? List<String>.from(json['image']) : [],
      offers: json['offers'] != null ? ServiceOffers.fromJson(json['offers']) : null,
      duration: json['duration'] as int?,
      status: json['status'] as String? ?? 'draft',
    );
  }
}

class ServiceOffers {
  final double price;
  final String priceCurrency;
  final String? availability;

  ServiceOffers({
    required this.price,
    required this.priceCurrency,
    this.availability,
  });

  factory ServiceOffers.fromJson(Map<String, dynamic> json) {
    return ServiceOffers(
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      priceCurrency: json['priceCurrency'] as String? ?? 'USD',
      availability: json['availability'] as String?,
    );
  }
}
