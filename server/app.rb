require 'sinatra/base'
require 'json'

class SRApp < Sinatra::Base

  def initialize
    @git_commit = ENV['GIT_HEAD']
    super
  end

  set :server, :thin
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :static_cache_control, [:no_cache, :must_revalidate]
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  configure do
    mime_type :manifest, 'text/cache-manifest'
  end

  before do
    expires 0
    cache_control :no_cache, :must_revalidate
  end

  get '/' do
    redirect '/index.html'
  end

  get '/manifest.appcache' do
    content_type :manifest
    erb :manifest_appcache
  end

  get '/title.html' do
    erb :title
  end
end
