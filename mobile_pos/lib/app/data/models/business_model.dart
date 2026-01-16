class Business {
  final String? id;
  final String name;
  final String slug;
  final String? type;
  final String? logo;
  final bool isDraft;
  final String? email;
  final String? category;
  final String? phone;

  Business({
    this.id,
    required this.name,
    required this.slug,
    this.type,
    this.logo,
    this.isDraft = false,
    this.email,
    this.category,
    this.phone,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    // Handle phone field which can be either a string or an object {code, number}
    String? phoneValue;
    if (json['phone'] != null) {
      if (json['phone'] is String) {
        phoneValue = json['phone'] as String;
      } else if (json['phone'] is Map) {
        final phoneMap = json['phone'] as Map<String, dynamic>;
        final code = phoneMap['code'] ?? '';
        final number =phoneMap['number'] ?? '';
        phoneValue = '$code$number'.trim();
      }
    }
    
    return Business(
      id: json['_id'] as String?,
      name: json['name'] as String,
      slug: json['slug'] as String,
      type: json['type'] as String?,
      logo: json['logo'] as String?,
      isDraft: json['isDraft'] as bool? ?? false,
      email: json['email'] is String ? json['email'] as String? : null,
      category: json['industry'] is String ? json['industry'] as String? : null,
      phone: phoneValue,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'slug': slug,
      'type': type,
      'logo': logo,
      'isDraft': isDraft,
      'email': email,
      'category': category,
      'phone': phone,
    };
  }
}
