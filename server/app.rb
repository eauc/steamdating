require 'sinatra/base'
require 'json'

class SRApp < Sinatra::Base

  def initialize
    super
  end

  set :server, :thin
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :static_cache_control, [:no_cache, :must_revalidate]
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/index.html'
  end

end
