class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? image;
  final String? jobTitle;
  final String? bio;
  final String? website;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.image,
    this.jobTitle,
    this.bio,
    this.website,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'user',
      status: json['status'] ?? 'active',
      image: json['image'],
      jobTitle: json['jobTitle'],
      bio: json['bio'],
      website: json['website'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'status': status,
      'image': image,
      'jobTitle': jobTitle,
      'bio': bio,
      'website': website,
    };
  }
}
