require 'sinatra/base'
require 'json'

class SRApp < Sinatra::Base

  def initialize
    super
  end

  set :server, :thin
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/index.html'
  end

end
