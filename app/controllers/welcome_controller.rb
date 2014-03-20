class WelcomeController < ApplicationController

  before_action :set_locale
 
  def index
    @transparent = true
  end
  
  def open_call
  end

  def project_info
    @user = User.new
    @site = Site.new
    @posters = Poster.order('id DESC').all   
  end

  
  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end
  
end
