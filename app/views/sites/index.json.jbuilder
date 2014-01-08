json.array!(@sites) do |site|
  json.extract! site, :id, :description, :reason, :name, :email
  json.url site_url(site, format: :json)
end
