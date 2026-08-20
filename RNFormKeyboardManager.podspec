require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
repository = package["repository"]
repository_url = repository.is_a?(Hash) ? repository["url"] : repository

Pod::Spec.new do |spec|
  spec.name = "RNFormKeyboardManager"
  spec.version = package["version"]
  spec.summary = package["description"]
  spec.homepage = package["homepage"]
  spec.license = package["license"]
  spec.authors = package["author"]
  spec.source = { :git => repository_url.sub(/^git\+/, ""), :tag => spec.version.to_s }
  spec.platforms = { :ios => min_ios_version_supported }
  spec.source_files = "ios/RNFormKeyboardManager/**/*.{h,m,mm}"

  install_modules_dependencies(spec)
end
