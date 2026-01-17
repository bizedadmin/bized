require 'xcodeproj'

project_path = 'ios/Runner.xcodeproj'
file_path = 'ios/Runner/GoogleService-Info.plist'

project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'Runner' }
group = project.main_group.find_sub_group('Runner')

# Check if file exists in group
file_ref = group.files.find { |f| f.path == 'GoogleService-Info.plist' }

if file_ref
  puts "File already exists in group."
else
  file_ref = group.new_reference('GoogleService-Info.plist')
  puts "Added file to group."
end

# Check if file is in build phases
build_phase = target.resources_build_phase
unless build_phase.files_references.include?(file_ref)
  build_phase.add_file_reference(file_ref)
  puts "Added file to build phase."
end

project.save
puts "Project saved."
